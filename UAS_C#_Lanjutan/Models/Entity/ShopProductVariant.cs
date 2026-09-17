using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UAS_C__Lanjutan.Models.Entity
{
    [Table("ShopProductVariants")]
    public class ShopProductVariant
    {
        [Key]
        public int Id { get; set; }

        public int ProductId { get; set; }

        [Required]
        [StringLength(50)]
        public string VariantType { get; set; } // "Ukuran", "Level Gula", "Paket"

        [Required]
        [StringLength(100)]
        public string VariantName { get; set; }

        public decimal ExtraPrice { get; set; } = 0;

        public bool IsDefault { get; set; } = false;

        [ForeignKey("ProductId")]
        public virtual ShopProduct Product { get; set; }
    }
}
