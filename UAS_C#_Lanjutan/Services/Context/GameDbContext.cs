using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using UAS_C__Lanjutan.Models.Entity;

namespace UAS_C__Lanjutan.Services.Context
{
    public partial class GameDbContext : DbContext
    {
        // "name=GameDbContext" ini akan membaca connectionStrings yang ada di Web.config
        public GameDbContext()
            : base("name=GameDbContext")
        {
            Database.SetInitializer<GameDbContext>(null);
            ((IObjectContextAdapter)this).ObjectContext.CommandTimeout = 600;
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Recipe> Recipes { get; set; }

        public DbSet<UserRecipe> UserRecipes { get; set; }
        public DbSet<RecipeIngredient> RecipeIngredients { get; set; }

        // Puzzle Game
        public DbSet<PuzzleLevel> PuzzleLevels { get; set; }
        public DbSet<UserPuzzleLevel> UserPuzzleLevels { get; set; }

        // Daily Missions & Achievements
        public DbSet<UserDailyMission> UserDailyMissions { get; set; }
        public DbSet<UserAchievement> UserAchievements { get; set; }
        public DbSet<UserFriend> UserFriends { get; set; }
        public DbSet<MabarRoom> MabarRooms { get; set; }
        public DbSet<MabarInvitation> MabarInvitations { get; set; }

        // Kyu Dessert E-Commerce Shop
        public DbSet<ShopCategory> ShopCategories { get; set; }
        public DbSet<ShopProduct> ShopProducts { get; set; }
        public DbSet<ShopProductVariant> ShopProductVariants { get; set; }
        public DbSet<ShopCartItem> ShopCartItems { get; set; }
        public DbSet<ShopOrder> ShopOrders { get; set; }
        public DbSet<ShopOrderItem> ShopOrderItems { get; set; }
        public DbSet<ShopProductReview> ShopProductReviews { get; set; }
        public DbSet<ShopVoucher> ShopVouchers { get; set; }
    }
}
