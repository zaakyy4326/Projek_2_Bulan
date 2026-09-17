using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Web.Http;
using UAS_C__Lanjutan.Models.Entity;
using UAS_C__Lanjutan.Services.Context;

namespace UAS_C__Lanjutan.Controllers
{
    [RoutePrefix("api/products")]
    public class ProductsApiController : ApiController
    {
        private readonly GameDbContext db = new GameDbContext();

        // 1. GET: api/products?page=1&limit=10&search=kue&status=active&sort=name_asc&category=1
        // Search, Filter, Sorting & Pagination API (Ketentuan Hal 4 & 7)
        [HttpGet]
        [Route("")]
        public IHttpActionResult GetProducts(
            int page = 1,
            int limit = 10,
            string search = null,
            string status = null,
            string sort = null,
            int? category = null)
        {
            try
            {
                if (page < 1) page = 1;
                if (limit < 1) limit = 10;
                if (limit > 50) limit = 50;

                var query = db.ShopProducts.Where(p => !p.IsDeleted);

                // Filter: Kategori
                if (category.HasValue && category.Value > 0)
                {
                    query = query.Where(p => p.CategoryId == category.Value);
                }

                // Filter: Status (active / inactive)
                if (!string.IsNullOrWhiteSpace(status))
                {
                    if (status.Equals("active", StringComparison.OrdinalIgnoreCase))
                        query = query.Where(p => p.IsActive);
                    else if (status.Equals("inactive", StringComparison.OrdinalIgnoreCase))
                        query = query.Where(p => !p.IsActive);
                }

                // Search: Keyword
                if (!string.IsNullOrWhiteSpace(search))
                {
                    search = search.Trim().ToLower();
                    query = query.Where(p => p.Name.ToLower().Contains(search) ||
                                             (p.ShortDescription != null && p.ShortDescription.ToLower().Contains(search)));
                }

                // Sorting: terbaru, terlama, A-Z (name_asc), Z-A (name_desc), price_asc, price_desc
                switch (sort?.ToLower())
                {
                    case "name_asc":
                    case "a-z":
                        query = query.OrderBy(p => p.Name);
                        break;
                    case "name_desc":
                    case "z-a":
                        query = query.OrderByDescending(p => p.Name);
                        break;
                    case "price_asc":
                        query = query.OrderBy(p => p.Price);
                        break;
                    case "price_desc":
                        query = query.OrderByDescending(p => p.Price);
                        break;
                    case "oldest":
                    case "terlama":
                        query = query.OrderBy(p => p.CreatedAt);
                        break;
                    case "newest":
                    case "terbaru":
                    default:
                        query = query.OrderByDescending(p => p.CreatedAt);
                        break;
                }

                int totalItems = query.Count();
                int totalPages = (int)Math.Ceiling((double)totalItems / limit);

                var items = query
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .Select(p => new
                    {
                        p.Id,
                        p.CategoryId,
                        CategoryName = p.Category != null ? p.Category.Name : null,
                        p.Name,
                        p.Slug,
                        p.Price,
                        p.OriginalPrice,
                        p.Stock,
                        p.Rating,
                        p.TotalReviews,
                        p.TotalSold,
                        p.ImageUrl,
                        p.ShortDescription,
                        p.BadgeText,
                        p.IsActive,
                        p.CreatedAt
                    })
                    .ToList();

                return Ok(new
                {
                    success = true,
                    page,
                    limit,
                    totalItems,
                    totalPages,
                    data = items
                });
            }
            catch (Exception ex)
            {
                return ResponseMessage(Request.CreateResponse(HttpStatusCode.InternalServerError, new
                {
                    success = false,
                    message = "Terjadi kesalahan pada server saat memuat data produk.",
                    error = ex.Message
                }));
            }
        }

        // 2. GET: api/products/5
        [HttpGet]
        [Route("{id:int}")]
        public IHttpActionResult GetProductById(int id)
        {
            var product = db.ShopProducts
                .Include(p => p.Category)
                .Include(p => p.Variants)
                .FirstOrDefault(p => p.Id == id && !p.IsDeleted);

            if (product == null)
            {
                return Content(HttpStatusCode.NotFound, new
                {
                    success = false,
                    message = $"Produk dengan ID {id} tidak ditemukan atau telah dihapus."
                });
            }

            return Ok(new
            {
                success = true,
                data = new
                {
                    product.Id,
                    product.CategoryId,
                    CategoryName = product.Category?.Name,
                    product.Name,
                    product.Slug,
                    product.ShortDescription,
                    product.FullDescription,
                    product.Price,
                    product.OriginalPrice,
                    product.Stock,
                    product.Rating,
                    product.TotalReviews,
                    product.TotalSold,
                    product.ImageUrl,
                    product.BadgeText,
                    product.IsFeatured,
                    product.IsActive,
                    product.CreatedAt,
                    Variants = product.Variants.Select(v => new
                    {
                        v.Id,
                        v.VariantType,
                        v.VariantName,
                        v.ExtraPrice,
                        v.IsDefault
                    })
                }
            });
        }

        // 3. POST: api/products (Create with Server-Side Validation)
        [HttpPost]
        [Route("")]
        public IHttpActionResult CreateProduct([FromBody] ProductCreateDto dto)
        {
            if (dto == null)
            {
                return Content(HttpStatusCode.BadRequest, new
                {
                    success = false,
                    message = "Body request tidak boleh kosong."
                });
            }

            var errors = new Dictionary<string, string>();

            // Validasi Server Side (Ketentuan Hal 5)
            if (string.IsNullOrWhiteSpace(dto.Name))
                errors["Name"] = "Nama produk wajib diisi.";
            else if (dto.Name.Length < 3)
                errors["Name"] = "Nama produk minimal 3 karakter.";
            else if (dto.Name.Length > 150)
                errors["Name"] = "Nama produk maksimal 150 karakter.";

            if (dto.Price <= 0)
                errors["Price"] = "Harga produk harus lebih besar dari 0.";

            if (dto.Stock < 0)
                errors["Stock"] = "Stok produk tidak boleh bernilai negatif.";

            if (dto.CategoryId <= 0 || !db.ShopCategories.Any(c => c.Id == dto.CategoryId))
                errors["CategoryId"] = "Kategori yang dipilih tidak valid.";

            if (string.IsNullOrWhiteSpace(dto.ImageUrl))
                dto.ImageUrl = "/Content/Images/products/default.jpg";

            if (errors.Count > 0)
            {
                return Content((HttpStatusCode)422, new // 422 Validation Error
                {
                    success = false,
                    message = "Validasi data produk gagal.",
                    errors
                });
            }

            try
            {
                string slug = GenerateSlug(dto.Name);

                var product = new ShopProduct
                {
                    Name = dto.Name.Trim(),
                    Slug = slug,
                    CategoryId = dto.CategoryId,
                    Price = dto.Price,
                    OriginalPrice = dto.OriginalPrice,
                    Stock = dto.Stock,
                    ShortDescription = dto.ShortDescription,
                    FullDescription = dto.FullDescription,
                    ImageUrl = dto.ImageUrl,
                    BadgeText = dto.BadgeText,
                    IsFeatured = dto.IsFeatured,
                    IsActive = dto.IsActive,
                    CreatedAt = DateTime.Now,
                    IsDeleted = false
                };

                db.ShopProducts.Add(product);
                db.SaveChanges();

                return Content(HttpStatusCode.Created, new
                {
                    success = true,
                    message = "Produk dessert berhasil ditambahkan! 🍰",
                    data = new { product.Id, product.Name, product.Price, product.Stock }
                });
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError, new
                {
                    success = false,
                    message = "Gagal menyimpan produk ke database.",
                    error = ex.Message
                });
            }
        }

        // 4. PUT: api/products/5 (Full Update)
        [HttpPut]
        [Route("{id:int}")]
        public IHttpActionResult UpdateProduct(int id, [FromBody] ProductCreateDto dto)
        {
            if (dto == null)
            {
                return Content(HttpStatusCode.BadRequest, new { success = false, message = "Body request kosong." });
            }

            var product = db.ShopProducts.FirstOrDefault(p => p.Id == id && !p.IsDeleted);
            if (product == null)
            {
                return Content(HttpStatusCode.NotFound, new { success = false, message = $"Produk ID {id} tidak ditemukan." });
            }

            var errors = new Dictionary<string, string>();
            if (string.IsNullOrWhiteSpace(dto.Name))
                errors["Name"] = "Nama produk wajib diisi.";
            if (dto.Price <= 0)
                errors["Price"] = "Harga harus lebih dari 0.";
            if (dto.Stock < 0)
                errors["Stock"] = "Stok tidak boleh negatif.";

            if (errors.Count > 0)
            {
                return Content((HttpStatusCode)422, new { success = false, message = "Validasi gagal.", errors });
            }

            product.Name = dto.Name.Trim();
            product.CategoryId = dto.CategoryId;
            product.Price = dto.Price;
            product.OriginalPrice = dto.OriginalPrice;
            product.Stock = dto.Stock;
            product.ShortDescription = dto.ShortDescription;
            product.FullDescription = dto.FullDescription;
            if (!string.IsNullOrWhiteSpace(dto.ImageUrl)) product.ImageUrl = dto.ImageUrl;
            product.BadgeText = dto.BadgeText;
            product.IsFeatured = dto.IsFeatured;
            product.IsActive = dto.IsActive;

            db.SaveChanges();

            return Ok(new
            {
                success = true,
                message = $"Produk '{product.Name}' berhasil diperbarui! ✨",
                data = new { product.Id, product.Name, product.Price, product.Stock }
            });
        }

        // 5. PATCH: api/products/5 (Partial Update)
        [HttpPatch]
        [Route("{id:int}")]
        public IHttpActionResult PatchProduct(int id, [FromBody] ProductPatchDto dto)
        {
            if (dto == null)
            {
                return Content(HttpStatusCode.BadRequest, new { success = false, message = "Body request kosong." });
            }

            var product = db.ShopProducts.FirstOrDefault(p => p.Id == id && !p.IsDeleted);
            if (product == null)
            {
                return Content(HttpStatusCode.NotFound, new { success = false, message = $"Produk ID {id} tidak ditemukan." });
            }

            if (dto.Price.HasValue)
            {
                if (dto.Price.Value <= 0)
                    return Content((HttpStatusCode)422, new { success = false, message = "Harga harus lebih dari 0." });
                product.Price = dto.Price.Value;
            }

            if (dto.Stock.HasValue)
            {
                if (dto.Stock.Value < 0)
                    return Content((HttpStatusCode)422, new { success = false, message = "Stok tidak boleh negatif." });
                product.Stock = dto.Stock.Value;
            }

            if (dto.IsActive.HasValue)
            {
                product.IsActive = dto.IsActive.Value;
            }

            if (dto.BadgeText != null)
            {
                product.BadgeText = dto.BadgeText;
            }

            db.SaveChanges();

            return Ok(new
            {
                success = true,
                message = $"Status/stok produk '{product.Name}' berhasil diupdate!",
                data = new { product.Id, product.Name, product.Price, product.Stock, product.IsActive }
            });
        }

        // 6. DELETE: api/products/5 (Soft Delete)
        [HttpDelete]
        [Route("{id:int}")]
        public IHttpActionResult DeleteProduct(int id)
        {
            var product = db.ShopProducts.FirstOrDefault(p => p.Id == id && !p.IsDeleted);
            if (product == null)
            {
                return Content(HttpStatusCode.NotFound, new
                {
                    success = false,
                    message = $"Produk ID {id} tidak ditemukan atau sudah dihapus sebelumnya."
                });
            }

            // Menerapkan Soft Delete berstandar industri (Ketentuan Hal 7)
            product.IsDeleted = true;
            product.DeletedAt = DateTime.Now;
            product.IsActive = false;

            db.SaveChanges();

            return Ok(new
            {
                success = true,
                message = $"Produk '{product.Name}' berhasil dihapus (Soft Delete)! Data riwayat pesanan tetap aman.",
                deletedAt = product.DeletedAt
            });
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing) db.Dispose();
            base.Dispose(disposing);
        }

        private string GenerateSlug(string text)
        {
            string str = text.ToLower().Trim();
            str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
            str = Regex.Replace(str, @"\s+", " ").Trim();
            str = str.Replace(" ", "-");
            return str + "-" + Guid.NewGuid().ToString().Substring(0, 6);
        }
    }

    public class ProductCreateDto
    {
        public string Name { get; set; }
        public int CategoryId { get; set; }
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int Stock { get; set; } = 50;
        public string ShortDescription { get; set; }
        public string FullDescription { get; set; }
        public string ImageUrl { get; set; }
        public string BadgeText { get; set; }
        public bool IsFeatured { get; set; } = false;
        public bool IsActive { get; set; } = true;
    }

    public class ProductPatchDto
    {
        public decimal? Price { get; set; }
        public int? Stock { get; set; }
        public bool? IsActive { get; set; }
        public string BadgeText { get; set; }
    }
}
