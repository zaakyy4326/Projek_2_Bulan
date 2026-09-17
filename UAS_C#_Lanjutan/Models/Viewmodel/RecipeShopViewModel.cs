using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using UAS_C__Lanjutan.Models.Entity;

namespace UAS_C__Lanjutan.Models.Viewmodel
{
    public class RecipeShopViewModel
    {
        public User Player { get; set; }

        public List<Recipe> AllRecipes { get; set; }

        public List<int> OwnedRecipeIds { get; set; }
    }
}