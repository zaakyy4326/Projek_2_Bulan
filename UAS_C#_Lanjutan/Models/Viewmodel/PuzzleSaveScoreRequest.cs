using System;
using System.Collections.Generic;

namespace UAS_C__Lanjutan.Models.Viewmodel
{
    public class PuzzleSaveScoreRequest
    {
        public string Mode { get; set; } // "Classic" or "Adventure"
        public int Score { get; set; }
        public int? LevelId { get; set; } // Required if Mode == "Adventure"
        public int Stars { get; set; } // For Adventure mode
        public bool IsCompleted { get; set; } // For Adventure mode
    }
}
