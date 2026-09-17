using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using UAS_C__Lanjutan.Models.Viewmodel;
using UAS_C__Lanjutan.Services.Context;

namespace UAS_C__Lanjutan.Controllers.MVC
{
    public class RecipeShopController : Controller
    {
        private readonly GameDbContext db = new GameDbContext();

        public ActionResult Index()
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Account");

            int userId = (int)Session["UserId"];

            var player = db.Users.Find(userId);

            var recipes = db.Recipes
                            .Where(r => r.IsActive)
                            .ToList();

            var ownedRecipeIds = db.UserRecipes
                                   .Where(x => x.UserId == userId)
                                   .Select(x => x.RecipeId)
                                   .ToList();

            var vm = new RecipeShopViewModel
            {
                Player = player,
                AllRecipes = recipes,
                OwnedRecipeIds = ownedRecipeIds
            };

            return View(vm);
        }
    }
}