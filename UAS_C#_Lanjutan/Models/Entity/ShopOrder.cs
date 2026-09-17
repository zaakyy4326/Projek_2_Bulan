using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UAS_C__Lanjutan.Models.Entity
{
    [Table("ShopOrders")]
    public class ShopOrder
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string OrderCode { get; set; }

        public int UserId { get; set; }

        [Required]
        [StringLength(100)]
        public string RecipientName { get; set; }

        [Required]
        [StringLength(30)]
        public string RecipientPhone { get; set; }

        [Required]
        [StringLength(500)]
        public string DeliveryAddress { get; set; }

        [StringLength(255)]
        public string DeliveryNotes { get; set; }

        [Required]
        [StringLength(500)]
        public string ShippingMethod { get; set; } // Instant (1-2 Jam), Same Day, Reguler Express

        public decimal ShippingCost { get; set; } = 0;

        public DateTime? DeliveryDate { get; set; }

        [StringLength(50)]
        public string DeliveryTimeSlot { get; set; } // misal: "13:00 - 15:00"

        public decimal SubTotal { get; set; }

        public decimal DiscountAmount { get; set; } = 0;

        [StringLength(50)]
        public string VoucherCode { get; set; }

        public decimal GrandTotal { get; set; }

        [Required]
        [StringLength(50)]
        public string PaymentMethod { get; set; } // QRIS, BCA_VA, MANDIRI_VA, GOPAY, OVO, SHOPEEPAY

        [Required]
        [StringLength(30)]
        public string PaymentStatus { get; set; } = "Pending"; // Pending, Paid, Failed

        [Required]
        [StringLength(30)]
        public string OrderStatus { get; set; } = "Pending_Payment"; // Pending_Payment, Baking, On_Delivery, Completed, Cancelled

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime? PaidAt { get; set; }

        public DateTime? CompletedAt { get; set; }

        public virtual ICollection<ShopOrderItem> Items { get; set; }
    }
}
