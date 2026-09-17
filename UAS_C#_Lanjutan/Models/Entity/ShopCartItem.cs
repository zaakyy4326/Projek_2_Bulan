using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UAS_C__Lanjutan.Models.Entity
{
    [Table("ShopCartItems")]
    public class ShopCartItem
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

        public int ProductId { get; set; }

        [StringLength(255)]
        public string SelectedVariant { get; set; }

        public int Quantity { get; set; } = 1;

        [StringLength(255)]
        public string CustomNote { get; set; } // Pesan ucapan / lilin angka

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [ForeignKey("ProductId")]
        public virtual ShopProduct Product { get; set; }
    }
}
