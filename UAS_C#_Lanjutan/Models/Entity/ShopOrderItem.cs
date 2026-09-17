using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UAS_C__Lanjutan.Models.Entity
{
    [Table("ShopOrderItems")]
    public class ShopOrderItem
    {
        [Key]
        public int Id { get; set; }

        public int OrderId { get; set; }

        public int ProductId { get; set; }

        [Required]
        [StringLength(150)]
        public string ProductName { get; set; }

        [Required]
        [StringLength(500)]
        public string ProductImage { get; set; }

        [StringLength(255)]
        public string VariantName { get; set; }

        public decimal Price { get; set; }

        public int Quantity { get; set; }

        public decimal SubTotal { get; set; }

        [StringLength(255)]
        public string CustomNote { get; set; }

        [ForeignKey("OrderId")]
        public virtual ShopOrder Order { get; set; }
    }
}
