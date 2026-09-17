using System.Collections.Generic;
using UAS_C__Lanjutan.Models.Entity;
using UAS_C__Lanjutan.Models.Viewmodel;

namespace UAS_C__Lanjutan.Services.Interface
{
    public interface IPuzzleService
    {
        bool SaveClassicHighScore(int userId, int score);
        bool SaveAdventureProgress(int userId, PuzzleSaveScoreRequest request);
        List<PuzzleLevel> GetAdventureLevels();
        List<UserPuzzleLevel> GetUserAdventureProgress(int userId);
        List<PuzzleUnlockedBlocksResponse> GetUnlockedBlocksForUser(int userId);
    }
}
