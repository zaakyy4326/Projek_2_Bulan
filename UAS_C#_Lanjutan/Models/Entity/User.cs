using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace UAS_C__Lanjutan.Models.Entity
{
    [Table("users")] // Memetakan class ini ke tabel 'users' di SSMS
    public class User
    {
        [Key]
        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [Column("username")]
        [StringLength(50)]
        public string Username { get; set; }

        [Required]
        [Column("password")]
        [StringLength(255)]
        public string Password { get; set; }

        [Column("total_coins")]
        public int TotalCoins { get; set; }

        [Column("high_score_bb")]
        public int HighScoreBb { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Required(ErrorMessage = "Email wajib diisi!")]
        [EmailAddress(ErrorMessage = "Format email tidak valid!")]
        [StringLength(100)]
        public string Email { get; set; }

        [StringLength(6)]
        public string OtpCode { get; set; }

        [Column("otp_expiry")]
        public DateTime? OtpExpiry { get; set; }

        [Column("avatar")]
        [StringLength(255)]
        public string Avatar { get; set; }

        [Column("last_username_change")]
        public DateTime? LastUsernameChange { get; set; }

        [Column("xp")]
        public int Xp { get; set; }

        [Column("level")]
        public int Level { get; set; }

        [Column("play_time_seconds")]
        public int PlayTimeSeconds { get; set; }

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        [Column("last_active")]
        public DateTime? LastActive { get; set; }

        [Column("role")]
        [StringLength(20)]
        public string Role { get; set; } = "User";
    }
}