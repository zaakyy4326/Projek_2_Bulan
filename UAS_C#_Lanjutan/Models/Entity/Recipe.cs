using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;


namespace UAS_C__Lanjutan.Models.Entity
{
    [Table("Recipes")]
    public class Recipe
    {
        [Key]
        public int RecipeId { get; set; }

        [Required]
        [StringLength(50)]
        public string RecipeName { get; set; }

        public int UnlockCost { get; set; }

        public int CoinReward { get; set; }

        [StringLength(50)]
        public string PackageType { get; set; }

        public bool IsActive { get; set; }

        public virtual ICollection<RecipeIngredient> Ingredients { get; set; }
    }
}