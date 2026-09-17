using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UAS_C__Lanjutan.Models.Entity
{
    [Table("UserAchievements")]
    public class UserAchievement
    {
        [Key]
        public int Id { get; set; }

        [Column("UserId")]
        public int UserId { get; set; }

        [Column("AchievementKey")]
        public string AchievementKey { get; set; }

        [Column("UnlockedAt")]
        public DateTime UnlockedAt { get; set; }

        [Column("IsPinned")]
        public bool IsPinned { get; set; }

        [Column("IsClaimed")]
        public bool IsClaimed { get; set; }
    }
}
