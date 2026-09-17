using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UAS_C__Lanjutan.Models.Entity
{
    [Table("mabar_rooms")]
    public class MabarRoom
    {
        [Key]
        [Column("room_id")]
        public int RoomId { get; set; }

        [Required]
        [Column("room_code")]
        [StringLength(10)]
        public string RoomCode { get; set; }

        [Column("host_user_id")]
        public int HostUserId { get; set; }

        [Column("guest_user_id")]
        public int? GuestUserId { get; set; }

        [Column("target_score")]
        public int TargetScore { get; set; } = 1000;

        [Column("time_limit_seconds")]
        public int TimeLimitSeconds { get; set; } = 180;

        [Column("status")]
        [StringLength(20)]
        public string Status { get; set; } = "Waiting"; // Waiting, Ready, Playing, Finished, Cancelled

        [Column("host_score")]
        public int HostScore { get; set; } = 0;

        [Column("guest_score")]
        public int GuestScore { get; set; } = 0;

        [Column("winner_user_id")]
        public int? WinnerUserId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Column("started_at")]
        public DateTime? StartedAt { get; set; }

        [Column("finished_at")]
        public DateTime? FinishedAt { get; set; }
    }
}
