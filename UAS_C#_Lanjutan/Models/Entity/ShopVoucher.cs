using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UAS_C__Lanjutan.Models.Entity
{
    [Table("ShopVouchers")]
    public class ShopVoucher
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string Code { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(255)]
        public string Description { get; set; }

        [Required]
        [StringLength(30)]
        public string DiscountType { get; set; } // PERCENT, FIXED, FREE_SHIPPING

        public decimal DiscountValue { get; set; }

        public decimal MinSpend { get; set; } = 0;

        public decimal? MaxDiscount { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
