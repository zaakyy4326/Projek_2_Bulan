using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UAS_C__Lanjutan.Models.Entity
{
    [Table("ShopProducts")]
    public class ShopProduct
    {
        [Key]
        public int Id { get; set; }

        public int CategoryId { get; set; }

        [Required]
        [StringLength(150)]
        public string Name { get; set; }

        [Required]
        [StringLength(150)]
        public string Slug { get; set; }

        [StringLength(255)]
        public string ShortDescription { get; set; }

        public string FullDescription { get; set; }

        public decimal Price { get; set; }

        public decimal? OriginalPrice { get; set; }

        [Required]
        [StringLength(500)]
        public string ImageUrl { get; set; }

        public decimal Rating { get; set; } = 5.0m;

        public int TotalReviews { get; set; } = 0;

        public int TotalSold { get; set; } = 0;

        public int Stock { get; set; } = 50;

        [StringLength(50)]
        public string BadgeText { get; set; }

        public bool IsFeatured { get; set; } = false;

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        public DateTime? DeletedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey("CategoryId")]
        public virtual ShopCategory Category { get; set; }

        public virtual ICollection<ShopProductVariant> Variants { get; set; }
        public virtual ICollection<ShopProductReview> Reviews { get; set; }
    }
}
