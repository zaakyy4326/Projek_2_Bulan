using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UAS_C__Lanjutan.Models.Entity
{
    [Table("ShopProductReviews")]
    public class ShopProductReview
    {
        [Key]
        public int Id { get; set; }

        public int ProductId { get; set; }

        public int? OrderId { get; set; }

        public int UserId { get; set; }

        public int Rating { get; set; } = 5;

        [Required]
        public string Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey("ProductId")]
        public virtual ShopProduct Product { get; set; }
    }
}
