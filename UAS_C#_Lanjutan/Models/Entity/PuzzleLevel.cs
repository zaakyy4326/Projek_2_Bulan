using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UAS_C__Lanjutan.Models.Entity
{
    [Table("PuzzleLevels")]
    public class PuzzleLevel
    {
        [Key]
        public int LevelId { get; set; }

        public int LevelNumber { get; set; }

        public int TargetScore { get; set; } // Only used for Bonus Level now

        public int RewardCoins { get; set; }

        public bool IsActive { get; set; } = true;

        // Adventure Mode Specifics
        public int RequiredStars { get; set; } = 0;
        
        public int? RequiredRecipeId { get; set; } // Null if no recipe required
        
        public bool IsBonusLevel { get; set; } = false;

        public string TargetDessertsJson { get; set; } // e.g. [{"Dessert":"Donat", "Qty":10}, {"Dessert":"Cupcake", "Qty":5}]

        public int StarBlocksCount { get; set; } = 2; // Default 2 stars hidden in regular level

        public string BoardLayoutJson { get; set; } // 8x8 initial board state
    }
}
