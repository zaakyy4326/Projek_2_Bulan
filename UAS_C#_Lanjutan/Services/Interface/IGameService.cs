using System.Collections.Generic;
using UAS_C__Lanjutan.Models.Entity;

namespace UAS_C__Lanjutan.Services.Interface
{
    public interface IGameService
    {
        string CekKoneksiDB();

        bool TambahKoinUser(int userId, int jumlahKoin);

        User GetUserById(int userId);

        List<Recipe> GetAllRecipes();

        bool IsRecipeUnlocked(int userId, int recipeId);

        bool UnlockRecipe(int userId, int recipeId);

        List<Recipe> GetAllRecipesWithIngredients();
        List<Recipe> GetUnlockedRecipesWithIngredients(int userId);

        List<int> GetUnlockedRecipeIds(int userId);
    }
}
