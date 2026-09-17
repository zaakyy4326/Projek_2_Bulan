using System;
using System.Collections.Generic;
using System.Linq;
using UAS_C__Lanjutan.Models.Entity;
using UAS_C__Lanjutan.Services.Base;
using UAS_C__Lanjutan.Services.Interface;
using System.Data.Entity;

namespace UAS_C__Lanjutan.Services.Impl
{
    public class GameService : BaseService, IGameService
    {
        public GameService() : base() { }

        public string CekKoneksiDB()
        {
            return "";
        }

        public bool TambahKoinUser(int userId, int jumlahKoin)
        {
            try
            {
                // 1. Cari data user di database berdasarkan userId yang sedang login
                var user = context.Users.FirstOrDefault(u => u.UserId == userId);

                // 2. Validasi apakah user-nya ketemu atau tidak
                if (user != null)
                {
                    // 3. Tambahkan koin baru dari game ke total koin lama yang sudah ada di database
                    user.TotalCoins += jumlahKoin;

                    // 4. Simpan perubahan tersebut secara permanen ke SQL Server
                    context.SaveChanges();
                    return true; // Berhasil disimpan!
                }

                return false; // User tidak ditemukan
            }
            catch (Exception)
            {
                // Jika ada error jaringan database atau sql, kembalikan false agar tidak crash
                return false;
            }
        }

        public User GetUserById(int userId)
        {
            // Mengambil data user lengkap berdasarkan ID-nya
            return context.Users.FirstOrDefault(u => u.UserId == userId);
        }

        public List<Recipe> GetAllRecipes()
        {
            return context.Recipes
                   .Where(r => r.IsActive)
                   .OrderBy(r => r.RecipeId)
                   .ToList();
        }

        public bool IsRecipeUnlocked(int userId, int recipeId)
        {
            return context.UserRecipes.Any(x =>
          x.UserId == userId &&
          x.RecipeId == recipeId);
        }

        public bool UnlockRecipe(int userId, int recipeId)
        {
            try
            {
                var user = context.Users
                                  .FirstOrDefault(x => x.UserId == userId);

                var recipe = context.Recipes
                                    .FirstOrDefault(x => x.RecipeId == recipeId);

                if (user == null || recipe == null)
                    return false;

                bool sudahUnlock = context.UserRecipes.Any(x =>
                                    x.UserId == userId &&
                                    x.RecipeId == recipeId);

                if (sudahUnlock)
                    return false;

                if (user.TotalCoins < recipe.UnlockCost)
                    return false;

                user.TotalCoins -= recipe.UnlockCost;

                context.UserRecipes.Add(new UserRecipe
                {
                    UserId = userId,
                    RecipeId = recipeId,
                    UnlockedAt = DateTime.Now
                });

                context.SaveChanges();

                return true;
            }
            catch
            {
                return false;
            }
        }

        public List<Recipe> GetAllRecipesWithIngredients()
        {
            return context.Recipes
                   .Include(x => x.Ingredients)
                   .Where(x => x.IsActive)
                   .OrderBy(x => x.RecipeId)
                   .ToList();
        }

        public List<Recipe> GetUnlockedRecipesWithIngredients(int userId)
        {
            var recipeIds = context.UserRecipes
                                   .Where(x => x.UserId == userId)
                                   .Select(x => x.RecipeId)
                                   .ToList();

            return context.Recipes
                          .Include(x => x.Ingredients)
                          .Where(x => recipeIds.Contains(x.RecipeId) && x.IsActive)
                          .OrderBy(x => x.RecipeId)
                          .ToList();
        }

        public List<int> GetUnlockedRecipeIds(int userId)
        {
            return context.UserRecipes
      .Where(x => x.UserId == userId)
      .Select(x => x.RecipeId)
      .ToList();
        }

        public LevelUpResult AddUserXp(int userId, int amount)
        {
            var user = context.Users.FirstOrDefault(u => u.UserId == userId);
            if (user == null) return new LevelUpResult { LeveledUp = false };

            user.Xp += amount;
            bool leveledUp = false;

            while (user.Xp >= 300)
            {
                user.Xp -= 300;
                user.Level += 1;
                leveledUp = true;
            }

            context.Entry(user).State = EntityState.Modified;
            context.SaveChanges();

            return new LevelUpResult { LeveledUp = leveledUp, NewLevel = user.Level };
        }

        public AchievementUnlockResult CheckAndUnlockAchievement(int userId, string key)
        {
            // Cek apakah sudah pernah unlock
            var exist = context.UserAchievements.Any(a => a.UserId == userId && a.AchievementKey == key);
            if (exist) return new AchievementUnlockResult { Unlocked = false };

            // Tentukan gelar, voucher, dan XP berdasarkan key
            int xp = 100;
            string name = "";
            string voucher = "";

            switch (key)
            {
                case "ChefMagang":
                    name = "Chef Magang 🧑‍🍳";
                    voucher = "DK-ONGKIR10";
                    xp = 100;
                    break;
                case "MasterPastry":
                    name = "Master Pastry Chef 👑";
                    voucher = "DK-KUE15K";
                    xp = 300;
                    break;
                case "SoClose":
                    name = "Koki Kilat ⚡";
                    voucher = "DK-CLOSE5K";
                    xp = 100;
                    break;
                case "PlayTime":
                    name = "Pelanggan Setia 🕰️";
                    voucher = "DK-SETIA50K";
                    xp = 150;
                    break;
                case "BintangKejora":
                    name = "Bintang Kejora ⭐";
                    voucher = "DK-STAR10K";
                    xp = 150;
                    break;
                case "DewaDessert":
                    name = "Dewa Dessert 🏁";
                    voucher = "DK-DEWA30K";
                    xp = 500;
                    break;
                case "RajaBlok":
                    name = "Raja Blok 🧱";
                    voucher = "DK-BLOK20";
                    xp = 250;
                    break;
                default:
                    return new AchievementUnlockResult { Unlocked = false };
            }

            var ua = new UserAchievement
            {
                UserId = userId,
                AchievementKey = key,
                UnlockedAt = DateTime.Now,
                IsPinned = false,
                IsClaimed = false
            };
            context.UserAchievements.Add(ua);
            context.SaveChanges();

            var lvResult = AddUserXp(userId, xp);

            return new AchievementUnlockResult
            {
                Unlocked = true,
                AchievementName = name,
                XpGained = xp,
                VoucherCode = string.IsNullOrEmpty(voucher) ? "" : $"{voucher}-U{userId}",
                LeveledUp = lvResult.LeveledUp,
                NewLevel = lvResult.NewLevel
            };
        }

        public void AutoSyncUserAchievements(int userId)
        {
            try
            {
                var user = context.Users.FirstOrDefault(u => u.UserId == userId);
                if (user == null) return;

                // 1. ChefMagang (>= 4 resep) & MasterPastry (>= 8 resep)
                int recipeCount = context.UserRecipes.Count(r => r.UserId == userId);
                if (recipeCount >= 4)
                {
                    CheckAndUnlockAchievement(userId, "ChefMagang");
                }
                if (recipeCount >= 8)
                {
                    CheckAndUnlockAchievement(userId, "MasterPastry");
                }

                // 2. PlayTime (Akumulasi 45 menit = 2700 detik)
                if (user.PlayTimeSeconds >= 2700)
                {
                    CheckAndUnlockAchievement(userId, "PlayTime");
                }

                // 3. BintangKejora (50 Bintang di Petualangan)
                int totalStars = context.UserPuzzleLevels
                    .Where(p => p.UserId == userId)
                    .Select(p => (int?)p.Stars)
                    .Sum() ?? 0;
                if (totalStars >= 50)
                {
                    CheckAndUnlockAchievement(userId, "BintangKejora");
                }

                // 4. DewaDessert (Selesaikan 150 Level Petualangan)
                bool completed150 = context.UserPuzzleLevels
                    .Any(p => p.UserId == userId && p.PuzzleLevel.LevelNumber >= 150 && p.IsCompleted);
                if (completed150)
                {
                    CheckAndUnlockAchievement(userId, "DewaDessert");
                }

                // 5. RajaBlok (Skor Klasik >= 1.000.000)
                if (user.HighScoreBb >= 1000000)
                {
                    CheckAndUnlockAchievement(userId, "RajaBlok");
                }
            }
            catch (Exception)
            {
                // Silently ignore sync errors
            }
        }
    }

    public class LevelUpResult
    {
        public bool LeveledUp { get; set; }
        public int NewLevel { get; set; }
    }

    public class AchievementUnlockResult
    {
        public bool Unlocked { get; set; }
        public string AchievementName { get; set; }
        public int XpGained { get; set; }
        public string VoucherCode { get; set; }
        public bool LeveledUp { get; set; }
        public int NewLevel { get; set; }
    }
}
