using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace UAS_C__Lanjutan.Models.Entity
{
    [Table("UserRecipes")]
    public class UserRecipe
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }

        public int RecipeId { get; set; }

        public DateTime UnlockedAt { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [ForeignKey("RecipeId")]
        public virtual Recipe Recipe { get; set; }
    }
}