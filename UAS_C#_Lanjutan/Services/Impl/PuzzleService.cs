using System;
using System.Collections.Generic;
using System.Linq;
using UAS_C__Lanjutan.Models.Entity;
using UAS_C__Lanjutan.Models.Viewmodel;
using UAS_C__Lanjutan.Services.Context;
using UAS_C__Lanjutan.Services.Interface;

namespace UAS_C__Lanjutan.Services.Impl
{
    public class PuzzleService : IPuzzleService
    {
        private readonly GameDbContext _context;

        public PuzzleService()
        {
            _context = new GameDbContext();
        }

        public bool SaveClassicHighScore(int userId, int score)
        {
            try
            {
                var user = _context.Users.FirstOrDefault(u => u.UserId == userId);
                if (user != null)
                {
                    // Update only if new score is higher
                    if (score > user.HighScoreBb)
                    {
                        user.HighScoreBb = score;
                        _context.SaveChanges();
                        return true;
                    }
                    return false; // Did not beat high score
                }
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }

        public bool SaveAdventureProgress(int userId, PuzzleSaveScoreRequest request)
        {
            if (!request.LevelId.HasValue) return false;

            try
            {
                var level = _context.PuzzleLevels.FirstOrDefault(l => l.LevelId == request.LevelId.Value);
                if (level == null) return false;

                var progress = _context.UserPuzzleLevels
                    .FirstOrDefault(p => p.UserId == userId && p.LevelId == request.LevelId.Value);
                
                var user = _context.Users.FirstOrDefault(u => u.UserId == userId);

                if (progress == null)
                {
                    // First time completing or saving score for this level
                    progress = new UserPuzzleLevel
                    {
                        UserId = userId,
                        LevelId = request.LevelId.Value,
                        HighScore = request.Score,
                        Stars = request.Stars,
                        IsCompleted = request.IsCompleted,
                        CompletedAt = request.IsCompleted ? (DateTime?)DateTime.Now : null
                    };
                    _context.UserPuzzleLevels.Add(progress);
                }
                else
                {
                    // Update existing progress
                    if (request.Score > progress.HighScore)
                        progress.HighScore = request.Score;
                    
                    if (request.Stars > progress.Stars)
                        progress.Stars = request.Stars;

                    if (!progress.IsCompleted && request.IsCompleted)
                    {
                        progress.IsCompleted = true;
                        progress.CompletedAt = DateTime.Now;
                    }
                }

                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }

        public List<PuzzleLevel> GetAdventureLevels()
        {
            return _context.PuzzleLevels.Where(l => l.IsActive).OrderBy(l => l.LevelNumber).ToList();
        }

        public List<UserPuzzleLevel> GetUserAdventureProgress(int userId)
        {
            return _context.UserPuzzleLevels.Where(p => p.UserId == userId).ToList();
        }

        public List<PuzzleUnlockedBlocksResponse> GetUnlockedBlocksForUser(int userId)
        {
            // Join UserRecipes with Recipes to get the names of unlocked items
            var unlockedRecipes = (from ur in _context.UserRecipes
                                   join r in _context.Recipes on ur.RecipeId equals r.RecipeId
                                   where ur.UserId == userId && r.IsActive
                                   select new PuzzleUnlockedBlocksResponse
                                   {
                                       RecipeId = r.RecipeId,
                                       RecipeName = r.RecipeName
                                   }).ToList();
            
            return unlockedRecipes;
        }
    }
}
