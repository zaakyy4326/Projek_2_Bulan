using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;
using UAS_C__Lanjutan.Models.Entity;
using UAS_C__Lanjutan.Services.Context;

namespace UAS_C__Lanjutan.Controllers.MVC
{
    public class ShopController : Controller
    {
        private readonly GameDbContext _db = new GameDbContext();

        // Helper untuk mendapatkan User ID yang sedang login
        private int? GetCurrentUserId()
        {
            if (Session["UserId"] != null && int.TryParse(Session["UserId"].ToString(), out int uid))
            {
                return uid;
            }

            if (Session["username"] != null)
            {
                string uname = Session["username"].ToString();
                var user = _db.Users.FirstOrDefault(u => u.Username == uname);
                if (user != null)
                {
                    Session["UserId"] = user.UserId;
                    return user.UserId;
                }
            }

            return null;
        }

        private User GetCurrentUser()
        {
            int? uid = GetCurrentUserId();
            if (uid.HasValue)
            {
                return _db.Users.FirstOrDefault(u => u.UserId == uid.Value);
            }
            return null;
        }

        // Helper untuk menghitung jumlah item di keranjang
        private int GetCartCountInternal(int userId)
        {
            return _db.ShopCartItems.Where(c => c.UserId == userId).Sum(c => (int?)c.Quantity) ?? 0;
        }

        // ==========================================================
        // 1. KATALOG TOKO UTAMA (Index)
        // ==========================================================
        public ActionResult Index(string cat = "", string search = "", string sort = "popular", int page = 1, int pageSize = 8)
        {
            var user = GetCurrentUser();
            ViewBag.CurrentUser = user;
            ViewBag.CartCount = user != null ? GetCartCountInternal(user.UserId) : 0;

            var categories = _db.ShopCategories.Where(c => c.IsActive).OrderBy(c => c.DisplayOrder).ToList();
            ViewBag.Categories = categories;
            ViewBag.ActiveCategory = cat;
            ViewBag.SearchKeyword = search;
            ViewBag.ActiveSort = sort;

            var query = _db.ShopProducts.Include(p => p.Category).Where(p => p.IsActive && !p.IsDeleted);

            if (!string.IsNullOrEmpty(cat))
            {
                query = query.Where(p => p.Category.Slug == cat);
            }

            if (!string.IsNullOrEmpty(search))
            {
                string kw = search.Trim().ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(kw) || 
                                         p.ShortDescription.ToLower().Contains(kw) || 
                                         p.Category.Name.ToLower().Contains(kw));
            }

            switch (sort)
            {
                case "name_asc":
                    query = query.OrderBy(p => p.Name);
                    break;
                case "name_desc":
                    query = query.OrderByDescending(p => p.Name);
                    break;
                case "price_asc":
                    query = query.OrderBy(p => p.Price);
                    break;
                case "price_desc":
                    query = query.OrderByDescending(p => p.Price);
                    break;
                case "rating":
                    query = query.OrderByDescending(p => p.Rating).ThenByDescending(p => p.TotalReviews);
                    break;
                case "newest":
                    query = query.OrderByDescending(p => p.CreatedAt);
                    break;
                case "popular":
                default:
                    query = query.OrderByDescending(p => p.IsFeatured)
                                 .ThenByDescending(p => p.TotalSold)
                                 .ThenByDescending(p => p.Rating);
                    break;
            }

            // Pagination logic
            int totalItems = query.Count();
            int totalPages = (int)Math.Ceiling((double)totalItems / (pageSize > 0 ? pageSize : 8));
            if (totalPages < 1) totalPages = 1;
            if (page < 1) page = 1;
            if (page > totalPages) page = totalPages;

            var products = query.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            ViewBag.CurrentPage = page;
            ViewBag.PageSize = pageSize;
            ViewBag.TotalPages = totalPages;
            ViewBag.TotalItems = totalItems;

            return View(products);
        }

        // ==========================================================
        // 2. DETAIL PRODUK (ProductDetail)
        // ==========================================================
        public ActionResult ProductDetail(int id)
        {
            var user = GetCurrentUser();
            ViewBag.CurrentUser = user;
            ViewBag.CartCount = user != null ? GetCartCountInternal(user.UserId) : 0;

            var product = _db.ShopProducts
                             .Include(p => p.Category)
                             .Include(p => p.Variants)
                             .FirstOrDefault(p => p.Id == id && p.IsActive && !p.IsDeleted);

            if (product == null)
            {
                return RedirectToAction("Index");
            }

            // Reviews
            var reviews = _db.ShopProductReviews
                             .Where(r => r.ProductId == id)
                             .OrderByDescending(r => r.CreatedAt)
                             .Take(15)
                             .ToList();
            ViewBag.Reviews = reviews;

            // Map user IDs to usernames for reviews
            var userIds = reviews.Select(r => r.UserId).Distinct().ToList();
            var userDict = _db.Users.Where(u => userIds.Contains(u.UserId))
                                   .ToDictionary(u => u.UserId, u => u.Username);
            ViewBag.UserDict = userDict;

            // Related Products
            var related = _db.ShopProducts
                             .Where(p => p.CategoryId == product.CategoryId && p.Id != product.Id && p.IsActive && !p.IsDeleted)
                             .Take(4)
                             .ToList();
            ViewBag.RelatedProducts = related;

            return View(product);
        }

        // ==========================================================
        // 3. KERANJANG BELANJA (Cart & AJAX Operations)
        // ==========================================================
        [HttpPost]
        public ActionResult AddToCart(int productId, string variant = "", int qty = 1, string customNote = "")
        {
            int? uid = GetCurrentUserId();
            if (!uid.HasValue)
            {
                return Json(new { success = false, requireLogin = true, message = "Silakan login terlebih dahulu untuk berbelanja!" });
            }

            if (qty < 1) qty = 1;

            var product = _db.ShopProducts.FirstOrDefault(p => p.Id == productId && p.IsActive && !p.IsDeleted);
            if (product == null)
            {
                return Json(new { success = false, message = "Produk tidak ditemukan atau sudah tidak tersedia." });
            }

            variant = (variant ?? "").Trim();
            customNote = (customNote ?? "").Trim();

            var existingItem = _db.ShopCartItems.FirstOrDefault(c => c.UserId == uid.Value && 
                                                                     c.ProductId == productId && 
                                                                     (c.SelectedVariant ?? "") == variant && 
                                                                     (c.CustomNote ?? "") == customNote);

            if (existingItem != null)
            {
                existingItem.Quantity += qty;
            }
            else
            {
                var newItem = new ShopCartItem
                {
                    UserId = uid.Value,
                    ProductId = productId,
                    SelectedVariant = variant,
                    Quantity = qty,
                    CustomNote = customNote,
                    CreatedAt = DateTime.Now
                };
                _db.ShopCartItems.Add(newItem);
            }

            _db.SaveChanges();

            int cartCount = GetCartCountInternal(uid.Value);
            return Json(new { success = true, message = $"Berhasil menambahkan {product.Name} ke keranjang!", cartCount = cartCount });
        }

        [HttpGet]
        public ActionResult GetCartCount()
        {
            int? uid = GetCurrentUserId();
            int count = uid.HasValue ? GetCartCountInternal(uid.Value) : 0;
            return Json(new { count = count }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Cart()
        {
            int? uid = GetCurrentUserId();
            if (!uid.HasValue)
            {
                return RedirectToAction("Login", "Account", new { returnUrl = Url.Action("Cart", "Shop") });
            }

            var user = GetCurrentUser();
            ViewBag.CurrentUser = user;
            ViewBag.CartCount = GetCartCountInternal(uid.Value);

            var cartItems = _db.ShopCartItems
                               .Include(c => c.Product)
                               .Where(c => c.UserId == uid.Value)
                               .OrderByDescending(c => c.CreatedAt)
                               .ToList();

            // Load Achievement Vouchers for this user
            var unlockedAchievements = _db.UserAchievements
                                         .Where(a => a.UserId == uid.Value)
                                         .Select(a => a.AchievementKey)
                                         .ToList();

            var availableVouchers = GetAvailableVouchersForUser(uid.Value, unlockedAchievements);
            ViewBag.AvailableVouchers = availableVouchers;

            return View(cartItems);
        }

        [HttpPost]
        public ActionResult UpdateCartQty(int cartItemId, int qty)
        {
            int? uid = GetCurrentUserId();
            if (!uid.HasValue) return Json(new { success = false, message = "Sesi habis." });

            var item = _db.ShopCartItems.Include(c => c.Product).FirstOrDefault(c => c.Id == cartItemId && c.UserId == uid.Value);
            if (item == null) return Json(new { success = false, message = "Item tidak ditemukan." });

            if (qty <= 0)
            {
                _db.ShopCartItems.Remove(item);
            }
            else
            {
                item.Quantity = qty;
            }
            _db.SaveChanges();

            var remainingItems = _db.ShopCartItems.Include(c => c.Product).Where(c => c.UserId == uid.Value).ToList();
            decimal newSubTotal = 0;
            foreach (var ci in remainingItems)
            {
                decimal itemPrice = ci.Product.Price;
                // Parse variant extra price if any
                if (!string.IsNullOrEmpty(ci.SelectedVariant) && ci.SelectedVariant.Contains("+Rp"))
                {
                    // Check if extra price is in variant table or pattern
                    var vMatch = _db.ShopProductVariants.FirstOrDefault(v => v.ProductId == ci.ProductId && ci.SelectedVariant.Contains(v.VariantName));
                    if (vMatch != null) itemPrice += vMatch.ExtraPrice;
                }
                newSubTotal += (itemPrice * ci.Quantity);
            }

            int cartCount = remainingItems.Sum(c => c.Quantity);

            return Json(new { 
                success = true, 
                cartCount = cartCount, 
                subTotal = newSubTotal,
                formattedSubTotal = string.Format("Rp {0:N0}", newSubTotal)
            });
        }

        [HttpPost]
        public ActionResult RemoveCartItem(int cartItemId)
        {
            return UpdateCartQty(cartItemId, 0);
        }

        // ==========================================================
        // 4. CHECKOUT & VALIDASI VOUCHER
        // ==========================================================
        public ActionResult Checkout()
        {
            int? uid = GetCurrentUserId();
            if (!uid.HasValue)
            {
                return RedirectToAction("Login", "Account", new { returnUrl = Url.Action("Checkout", "Shop") });
            }

            var user = GetCurrentUser();
            ViewBag.CurrentUser = user;

            var cartItems = _db.ShopCartItems
                               .Include(c => c.Product)
                               .Where(c => c.UserId == uid.Value)
                               .ToList();

            if (!cartItems.Any())
            {
                return RedirectToAction("Cart");
            }

            // Hitung subtotal dengan varian
            decimal subTotal = 0;
            foreach (var item in cartItems)
            {
                decimal price = item.Product.Price;
                if (!string.IsNullOrEmpty(item.SelectedVariant))
                {
                    var vMatch = _db.ShopProductVariants.FirstOrDefault(v => v.ProductId == item.ProductId && item.SelectedVariant.Contains(v.VariantName));
                    if (vMatch != null) price += vMatch.ExtraPrice;
                }
                subTotal += (price * item.Quantity);
            }
            ViewBag.SubTotal = subTotal;

            // Vouchers
            var unlockedAchievements = _db.UserAchievements
                                         .Where(a => a.UserId == uid.Value)
                                         .Select(a => a.AchievementKey)
                                         .ToList();
            var availableVouchers = GetAvailableVouchersForUser(uid.Value, unlockedAchievements);
            ViewBag.AvailableVouchers = availableVouchers;

            return View(cartItems);
        }

        [HttpPost]
        public ActionResult ValidateVoucher(string code, decimal subtotal, string shippingMethod = "Instant")
        {
            int? uid = GetCurrentUserId();
            if (string.IsNullOrWhiteSpace(code))
            {
                return Json(new { success = false, message = "Masukkan kode voucher!" });
            }

            code = code.Trim().ToUpper();
            string baseCode = code;

            // Proteksi Voucher Achievement (Berawalan DK-)
            if (code.StartsWith("DK-"))
            {
                if (!uid.HasValue)
                {
                    return Json(new { success = false, message = "Silakan login terlebih dahulu untuk menggunakan voucher pencapaian ini!" });
                }

                int lastDashIndex = code.LastIndexOf("-U");
                if (lastDashIndex == -1)
                {
                    return Json(new { 
                        success = false, 
                        message = $"Gunakan kode voucher lengkap khusus milik Anda (contoh: {code}-U{uid.Value}) yang tercantum di Buku Pencapaian!" 
                    });
                }

                string userSuffix = code.Substring(lastDashIndex + 2);
                if (!int.TryParse(userSuffix, out int voucherOwnerId) || voucherOwnerId != uid.Value)
                {
                    return Json(new { 
                        success = false, 
                        message = "Kode voucher ini milik akun pemain lain! Setiap pemain memiliki kode unik dari pencapaian akun masing-masing dan tidak dapat dipindahtangankan." 
                    });
                }

                baseCode = code.Substring(0, lastDashIndex);
            }

            var voucher = _db.ShopVouchers.FirstOrDefault(v => v.Code == baseCode && v.IsActive);
            if (voucher == null)
            {
                return Json(new { success = false, message = "Kode voucher tidak valid atau sudah kedaluwarsa." });
            }

            // Check if user is eligible for achievement voucher
            if (uid.HasValue)
            {
                var achKey = GetAchievementKeyForVoucher(baseCode);
                if (!string.IsNullOrEmpty(achKey))
                {
                    bool hasAchievement = _db.UserAchievements.Any(a => a.UserId == uid.Value && a.AchievementKey == achKey);
                    if (!hasAchievement)
                    {
                        return Json(new { 
                            success = false, 
                            message = $"Voucher {code} terkunci! Buka pencapaian '{achKey}' di game untuk menggunakannya." 
                        });
                    }
                }
            }

            if (subtotal < voucher.MinSpend)
            {
                return Json(new { 
                    success = false, 
                    message = $"Minimum belanja untuk voucher ini adalah Rp {voucher.MinSpend:N0}." 
                });
            }

            decimal shippingCost = GetShippingCost(shippingMethod);
            decimal discount = 0;

            if (voucher.DiscountType == "FREE_SHIPPING")
            {
                discount = Math.Min(voucher.DiscountValue, shippingCost);
            }
            else if (voucher.DiscountType == "PERCENT")
            {
                discount = (subtotal * voucher.DiscountValue) / 100m;
                if (voucher.MaxDiscount.HasValue && discount > voucher.MaxDiscount.Value)
                {
                    discount = voucher.MaxDiscount.Value;
                }
            }
            else // FIXED
            {
                discount = Math.Min(voucher.DiscountValue, subtotal);
            }

            return Json(new {
                success = true,
                code = code,
                name = voucher.Name,
                discountType = voucher.DiscountType,
                discountAmount = discount,
                formattedDiscount = string.Format("Rp {0:N0}", discount),
                message = $"Voucher '{voucher.Name}' berhasil digunakan!"
            });
        }

        // ==========================================================
        // 5. PEMBUATAN PESANAN (PlaceOrder)
        // ==========================================================
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult PlaceOrder(
            string recipientName, 
            string recipientPhone, 
            string deliveryAddress, 
            string deliveryNotes, 
            string shippingMethod, 
            string deliveryDate, 
            string deliveryTimeSlot, 
            string voucherCode, 
            string paymentMethod)
        {
            int? uid = GetCurrentUserId();
            if (!uid.HasValue) return RedirectToAction("Login", "Account");

            var cartItems = _db.ShopCartItems.Include(c => c.Product).Where(c => c.UserId == uid.Value).ToList();
            if (!cartItems.Any()) return RedirectToAction("Cart");

            if (string.IsNullOrWhiteSpace(recipientName) || string.IsNullOrWhiteSpace(recipientPhone) || string.IsNullOrWhiteSpace(deliveryAddress))
            {
                TempData["ErrorMessage"] = "Mohon lengkapi nama penerima, nomor telepon, dan alamat pengiriman!";
                return RedirectToAction("Checkout");
            }

            decimal subTotal = 0;
            foreach (var item in cartItems)
            {
                decimal price = item.Product.Price;
                if (!string.IsNullOrEmpty(item.SelectedVariant))
                {
                    var vMatch = _db.ShopProductVariants.FirstOrDefault(v => v.ProductId == item.ProductId && item.SelectedVariant.Contains(v.VariantName));
                    if (vMatch != null) price += vMatch.ExtraPrice;
                }
                subTotal += (price * item.Quantity);
            }

            decimal shippingCost = GetShippingCost(shippingMethod);
            decimal discount = 0;

            if (!string.IsNullOrWhiteSpace(voucherCode))
            {
                voucherCode = voucherCode.Trim().ToUpper();
                string baseCode = voucherCode;
                bool isVoucherEligible = true;

                if (voucherCode.StartsWith("DK-"))
                {
                    int lastDashIndex = voucherCode.LastIndexOf("-U");
                    if (lastDashIndex == -1)
                    {
                        isVoucherEligible = false;
                    }
                    else
                    {
                        string userSuffix = voucherCode.Substring(lastDashIndex + 2);
                        if (!int.TryParse(userSuffix, out int voucherOwnerId) || voucherOwnerId != uid.Value)
                        {
                            isVoucherEligible = false;
                        }
                        else
                        {
                            baseCode = voucherCode.Substring(0, lastDashIndex);
                            var achKey = GetAchievementKeyForVoucher(baseCode);
                            if (!string.IsNullOrEmpty(achKey))
                            {
                                bool hasAchievement = _db.UserAchievements.Any(a => a.UserId == uid.Value && a.AchievementKey == achKey);
                                if (!hasAchievement) isVoucherEligible = false;
                            }
                        }
                    }
                }

                if (isVoucherEligible)
                {
                    var voucher = _db.ShopVouchers.FirstOrDefault(v => v.Code == baseCode && v.IsActive);
                    if (voucher != null && subTotal >= voucher.MinSpend)
                    {
                        if (voucher.DiscountType == "FREE_SHIPPING")
                            discount = Math.Min(voucher.DiscountValue, shippingCost);
                        else if (voucher.DiscountType == "PERCENT")
                        {
                            discount = (subTotal * voucher.DiscountValue) / 100m;
                            if (voucher.MaxDiscount.HasValue && discount > voucher.MaxDiscount.Value)
                                discount = voucher.MaxDiscount.Value;
                        }
                        else
                            discount = Math.Min(voucher.DiscountValue, subTotal);
                    }
                }
                else
                {
                    voucherCode = null; // Batalkan penggunaan kode voucher yang tidak sah
                }
            }

            decimal grandTotal = Math.Max(0, (subTotal + shippingCost) - discount);

            // Generate Kode Order Unik
            string orderCode = $"KYU-{DateTime.Now:yyyyMMdd}-{new Random().Next(1000, 9999)}";

            DateTime? parsedDate = null;
            if (DateTime.TryParse(deliveryDate, out DateTime dt))
            {
                parsedDate = dt;
            }

            var order = new ShopOrder
            {
                OrderCode = orderCode,
                UserId = uid.Value,
                RecipientName = recipientName.Trim(),
                RecipientPhone = recipientPhone.Trim(),
                DeliveryAddress = deliveryAddress.Trim(),
                DeliveryNotes = (deliveryNotes ?? "").Trim(),
                ShippingMethod = shippingMethod ?? "Instant (1-2 Jam)",
                ShippingCost = shippingCost,
                DeliveryDate = parsedDate,
                DeliveryTimeSlot = deliveryTimeSlot,
                SubTotal = subTotal,
                DiscountAmount = discount,
                VoucherCode = voucherCode,
                GrandTotal = grandTotal,
                PaymentMethod = paymentMethod ?? "QRIS",
                PaymentStatus = "Pending",
                OrderStatus = "Pending_Payment",
                CreatedAt = DateTime.Now
            };

            _db.ShopOrders.Add(order);
            _db.SaveChanges();

            // Simpan Order Items
            foreach (var item in cartItems)
            {
                decimal itemPrice = item.Product.Price;
                if (!string.IsNullOrEmpty(item.SelectedVariant))
                {
                    var vMatch = _db.ShopProductVariants.FirstOrDefault(v => v.ProductId == item.ProductId && item.SelectedVariant.Contains(v.VariantName));
                    if (vMatch != null) itemPrice += vMatch.ExtraPrice;
                }

                var orderItem = new ShopOrderItem
                {
                    OrderId = order.Id,
                    ProductId = item.ProductId,
                    ProductName = item.Product.Name,
                    ProductImage = item.Product.ImageUrl,
                    VariantName = item.SelectedVariant,
                    Price = itemPrice,
                    Quantity = item.Quantity,
                    SubTotal = itemPrice * item.Quantity,
                    CustomNote = item.CustomNote
                };
                _db.ShopOrderItems.Add(orderItem);

                // Update TotalSold & Stock produk
                var prod = _db.ShopProducts.Find(item.ProductId);
                if (prod != null)
                {
                    prod.TotalSold += item.Quantity;
                    prod.Stock = Math.Max(0, prod.Stock - item.Quantity);
                }
            }

            // Hapus isi keranjang user
            _db.ShopCartItems.RemoveRange(cartItems);
            _db.SaveChanges();

            return RedirectToAction("Payment", new { id = order.Id, orderId = order.Id });
        }

        // ==========================================================
        // 6. PEMBAYARAN & SIMULASI (Payment & SimulatePay)
        // ==========================================================
        public ActionResult Payment(int? id, int? orderId)
        {
            int? uid = GetCurrentUserId();
            if (!uid.HasValue) return RedirectToAction("Login", "Account");

            int targetOrderId = id ?? orderId ?? 0;
            if (targetOrderId <= 0) return RedirectToAction("OrderHistory");

            var order = _db.ShopOrders
                           .Include(o => o.Items)
                           .FirstOrDefault(o => o.Id == targetOrderId && o.UserId == uid.Value);

            if (order == null) return RedirectToAction("OrderHistory");

            if (order.PaymentStatus == "Paid")
            {
                return RedirectToAction("OrderDetail", new { id = order.Id });
            }

            ViewBag.CurrentUser = GetCurrentUser();
            return View(order);
        }

        [HttpPost]
        public ActionResult SimulatePay(int orderId)
        {
            int? uid = GetCurrentUserId();
            if (!uid.HasValue) return Json(new { success = false, message = "Sesi habis." });

            var order = _db.ShopOrders.FirstOrDefault(o => o.Id == orderId && o.UserId == uid.Value);
            if (order == null) return Json(new { success = false, message = "Pesanan tidak ditemukan." });

            order.PaymentStatus = "Paid";
            order.OrderStatus = "Baking"; // Otomatis mulai diproses dapur!
            order.PaidAt = DateTime.Now;

            _db.SaveChanges();

            return Json(new { 
                success = true, 
                message = "Pembayaran Berhasil! Pesanan Anda sedang disiapkan di dapur Kyu Dessert.",
                redirectUrl = Url.Action("OrderDetail", new { id = order.Id })
            });
        }

        // ==========================================================
        // 7. RIWAYAT PESANAN & PELACAKAN (OrderHistory & OrderDetail)
        // ==========================================================
        public ActionResult OrderHistory(string status = "all")
        {
            int? uid = GetCurrentUserId();
            if (!uid.HasValue) return RedirectToAction("Login", "Account", new { returnUrl = Url.Action("OrderHistory", "Shop") });

            var user = GetCurrentUser();
            ViewBag.CurrentUser = user;
            ViewBag.CartCount = GetCartCountInternal(uid.Value);
            ViewBag.ActiveStatus = status;

            var query = _db.ShopOrders
                           .Include(o => o.Items)
                           .Where(o => o.UserId == uid.Value);

            if (status == "pending") query = query.Where(o => o.OrderStatus == "Pending_Payment");
            else if (status == "baking") query = query.Where(o => o.OrderStatus == "Baking");
            else if (status == "delivery") query = query.Where(o => o.OrderStatus == "On_Delivery");
            else if (status == "completed") query = query.Where(o => o.OrderStatus == "Completed");

            var orders = query.OrderByDescending(o => o.CreatedAt).ToList();
            return View(orders);
        }

        public ActionResult OrderDetail(int? id, int? orderId)
        {
            int? uid = GetCurrentUserId();
            if (!uid.HasValue) return RedirectToAction("Login", "Account");

            int targetOrderId = id ?? orderId ?? 0;
            if (targetOrderId <= 0) return RedirectToAction("OrderHistory");

            var order = _db.ShopOrders
                           .Include(o => o.Items)
                           .FirstOrDefault(o => o.Id == targetOrderId && o.UserId == uid.Value);

            if (order == null) return RedirectToAction("OrderHistory");

            // Auto progress check berdasarkan waktu sejak pembayaran (Realistis tanpa tombol manual)
            if (order.PaymentStatus == "Paid" && order.PaidAt.HasValue && order.OrderStatus != "Completed")
            {
                var elapsed = DateTime.Now - order.PaidAt.Value;
                if (elapsed.TotalSeconds >= 90)
                {
                    order.OrderStatus = "Completed";
                    order.CompletedAt = DateTime.Now;
                    _db.SaveChanges();
                }
                else if (elapsed.TotalSeconds >= 45 && order.OrderStatus == "Baking")
                {
                    order.OrderStatus = "On_Delivery";
                    _db.SaveChanges();
                }
            }

            ViewBag.CurrentUser = GetCurrentUser();
            ViewBag.CartCount = GetCartCountInternal(uid.Value);

            // Periksa apakah user sudah mereview produk di order ini (dilindungi try-catch)
            var reviewedProductIds = new List<int>();
            try
            {
                reviewedProductIds = _db.ShopProductReviews
                                        .Where(r => r.OrderId == targetOrderId && r.UserId == uid.Value)
                                        .Select(r => r.ProductId)
                                        .ToList();
            }
            catch
            {
                reviewedProductIds = new List<int>();
            }
            ViewBag.ReviewedProductIds = reviewedProductIds;

            return View(order);
        }

        // Endpoint polling status pesanan otomatis untuk Live Tracking
        [HttpGet]
        public ActionResult GetOrderStatus(int orderId)
        {
            int? uid = GetCurrentUserId();
            if (!uid.HasValue) return Json(new { success = false, message = "Sesi habis." }, JsonRequestBehavior.AllowGet);

            var order = _db.ShopOrders.FirstOrDefault(o => o.Id == orderId && o.UserId == uid.Value);
            if (order == null) return Json(new { success = false, message = "Pesanan tidak ditemukan." }, JsonRequestBehavior.AllowGet);

            // Auto progression
            if (order.PaymentStatus == "Paid" && order.PaidAt.HasValue && order.OrderStatus != "Completed")
            {
                var elapsed = DateTime.Now - order.PaidAt.Value;
                if (elapsed.TotalSeconds >= 90)
                {
                    order.OrderStatus = "Completed";
                    order.CompletedAt = DateTime.Now;
                    _db.SaveChanges();
                }
                else if (elapsed.TotalSeconds >= 45 && order.OrderStatus == "Baking")
                {
                    order.OrderStatus = "On_Delivery";
                    _db.SaveChanges();
                }
            }

            return Json(new {
                success = true,
                orderStatus = order.OrderStatus,
                paymentStatus = order.PaymentStatus,
                paidAt = order.PaidAt?.ToString("HH:mm:ss"),
                completedAt = order.CompletedAt?.ToString("HH:mm:ss")
            }, JsonRequestBehavior.AllowGet);
        }

        // Fitur Pesan Lagi (Reorder)
        [HttpPost]
        public ActionResult Reorder(int orderId)
        {
            int? uid = GetCurrentUserId();
            if (!uid.HasValue) return Json(new { success = false, message = "Silakan login terlebih dahulu." });

            var order = _db.ShopOrders.Include(o => o.Items).FirstOrDefault(o => o.Id == orderId && o.UserId == uid.Value);
            if (order == null) return Json(new { success = false, message = "Pesanan tidak ditemukan." });

            if (order.Items != null && order.Items.Any())
            {
                foreach (var item in order.Items)
                {
                    var existingCart = _db.ShopCartItems.FirstOrDefault(c => 
                        c.UserId == uid.Value && 
                        c.ProductId == item.ProductId && 
                        c.SelectedVariant == item.VariantName &&
                        c.CustomNote == item.CustomNote);

                    if (existingCart != null)
                    {
                        existingCart.Quantity += item.Quantity;
                    }
                    else
                    {
                        var newCart = new ShopCartItem
                        {
                            UserId = uid.Value,
                            ProductId = item.ProductId,
                            SelectedVariant = item.VariantName,
                            CustomNote = item.CustomNote,
                            Quantity = item.Quantity,
                            CreatedAt = DateTime.Now
                        };
                        _db.ShopCartItems.Add(newCart);
                    }
                }
                _db.SaveChanges();
            }

            return Json(new { 
                success = true, 
                message = "Semua item dari pesanan #" + order.OrderCode + " berhasil dimasukkan kembali ke keranjang belanja Anda!",
                redirectUrl = Url.Action("Cart", "Shop")
            });
        }

        // Perpanjang waktu timer QRIS jika habis
        [HttpPost]
        public ActionResult RenewPaymentTimer(int orderId)
        {
            int? uid = GetCurrentUserId();
            if (!uid.HasValue) return Json(new { success = false, message = "Sesi habis." });

            var order = _db.ShopOrders.FirstOrDefault(o => o.Id == orderId && o.UserId == uid.Value);
            if (order == null) return Json(new { success = false, message = "Pesanan tidak ditemukan." });

            order.CreatedAt = DateTime.Now;
            _db.SaveChanges();

            return Json(new { success = true, message = "Waktu pembayaran berhasil diperpanjang 15 menit." });
        }

        // Simulasi perubahan status pesanan (Dapur -> Kurir -> Selesai)
        [HttpPost]
        public ActionResult UpdateOrderStatus(int orderId, string status)
        {
            int? uid = GetCurrentUserId();
            if (!uid.HasValue) return Json(new { success = false, message = "Sesi habis." });

            var order = _db.ShopOrders.FirstOrDefault(o => o.Id == orderId && o.UserId == uid.Value);
            if (order == null) return Json(new { success = false, message = "Pesanan tidak ditemukan." });

            order.OrderStatus = status;
            if (status == "Completed")
            {
                order.CompletedAt = DateTime.Now;
            }
            _db.SaveChanges();

            return Json(new { success = true, newStatus = status });
        }

        // ==========================================================
        // 8. ULASAN & RATING (SubmitReview)
        // ==========================================================
        [HttpPost]
        public ActionResult SubmitReview(int productId, int orderId, int rating, string comment)
        {
            int? uid = GetCurrentUserId();
            if (!uid.HasValue) return Json(new { success = false, message = "Silakan login terlebih dahulu." });

            if (rating < 1) rating = 1;
            if (rating > 5) rating = 5;
            if (string.IsNullOrWhiteSpace(comment))
            {
                return Json(new { success = false, message = "Tuliskan sedikit komentar ulasan Anda." });
            }

            var product = _db.ShopProducts.Find(productId);
            if (product == null) return Json(new { success = false, message = "Produk tidak ditemukan." });

            var review = new ShopProductReview
            {
                ProductId = productId,
                OrderId = orderId,
                UserId = uid.Value,
                Rating = rating,
                Comment = comment.Trim(),
                CreatedAt = DateTime.Now
            };

            _db.ShopProductReviews.Add(review);
            _db.SaveChanges();

            // Recalculate product rating & total reviews
            var allReviews = _db.ShopProductReviews.Where(r => r.ProductId == productId).ToList();
            product.TotalReviews = allReviews.Count;
            product.Rating = Math.Round((decimal)allReviews.Average(r => r.Rating), 1);
            _db.SaveChanges();

            return Json(new { 
                success = true, 
                message = "Terima kasih! Ulasan manis Anda telah berhasil disimpan.",
                newRating = product.Rating,
                totalReviews = product.TotalReviews
            });
        }

        // ==========================================================
        // HELPER METHODS
        // ==========================================================
        private decimal GetShippingCost(string method)
        {
            if (string.IsNullOrEmpty(method)) return 20000;
            if (method.Contains("Instant")) return 20000;
            if (method.Contains("Same Day") || method.Contains("SameDay")) return 14000;
            return 9000; // Reguler
        }

        private string GetAchievementKeyForVoucher(string code)
        {
            switch (code)
            {
                case "DK-ONGKIR10": return "ChefMagang";
                case "DK-KUE15K": return "MasterPastry";
                case "DK-CLOSE5K": return "SoClose";
                case "DK-SETIA50K": return "PlayTime";
                case "DK-STAR10K": return "BintangKejora";
                case "DK-DEWA30K": return "DewaDessert";
                case "DK-BLOK20": return "RajaBlok";
                default: return null; // Universal vouchers like KYUWELCOME, KYUMANIS
            }
        }

        private List<ShopVoucher> GetAvailableVouchersForUser(int userId, List<string> userUnlockedAchievements)
        {
            var allVouchers = _db.ShopVouchers.Where(v => v.IsActive).ToList();
            var result = new List<ShopVoucher>();

            foreach (var v in allVouchers)
            {
                var reqAch = GetAchievementKeyForVoucher(v.Code);
                if (string.IsNullOrEmpty(reqAch))
                {
                    // Universal voucher like KYUWELCOME, KYUMANIS
                    result.Add(v);
                }
                else if (userUnlockedAchievements != null && userUnlockedAchievements.Contains(reqAch))
                {
                    // Achievement voucher khusus pemain ini
                    result.Add(new ShopVoucher
                    {
                        Id = v.Id,
                        Code = $"{v.Code}-U{userId}",
                        Name = v.Name,
                        Description = v.Description,
                        DiscountType = v.DiscountType,
                        DiscountValue = v.DiscountValue,
                        MinSpend = v.MinSpend,
                        MaxDiscount = v.MaxDiscount,
                        IsActive = v.IsActive
                    });
                }
            }

            return result;
        }

        // ==========================================================
        // 12. SOFT DELETE PRODUK (ShopProduct)
        // Memenuhi Standar Ketentuan Pembuatan Projekan S1
        // ==========================================================
        [HttpPost]
        public ActionResult DeleteProduct(int id)
        {
            var product = _db.ShopProducts.Find(id);
            if (product == null)
            {
                return Json(new { success = false, message = "Produk tidak ditemukan." });
            }

            product.IsDeleted = true;
            product.DeletedAt = DateTime.Now;
            _db.Entry(product).State = EntityState.Modified;
            _db.SaveChanges();

            return Json(new { success = true, message = $"Produk '{product.Name}' berhasil dinonaktifkan (soft deleted)." });
        }
    }
}
