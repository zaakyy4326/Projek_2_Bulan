using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UAS_C__Lanjutan.Models.Entity
{
    [Table("UserPuzzleLevels")]
    public class UserPuzzleLevel
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

        public int LevelId { get; set; }

        public int HighScore { get; set; } = 0;

        public int Stars { get; set; } = 0;

        public bool IsCompleted { get; set; } = false;

        public DateTime? CompletedAt { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [ForeignKey("LevelId")]
        public virtual PuzzleLevel PuzzleLevel { get; set; }
    }
}
