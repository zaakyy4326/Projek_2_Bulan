using System;
using System.Collections.Generic;

namespace UAS_C__Lanjutan.Models.Viewmodel
{
    public class PuzzleUnlockedBlocksResponse
    {
        public int RecipeId { get; set; }
        public string RecipeName { get; set; }
        // Future use: e.g., mapping recipe to block colors or shape.
        // For now, returning the name helps frontend load the respective image.
    }
}
