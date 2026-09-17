using System;
using System.Linq;
using System.Web.Mvc;
using UAS_C__Lanjutan.Models.Entity;
using UAS_C__Lanjutan.Models.Viewmodel;
using UAS_C__Lanjutan.Services.Impl;
using UAS_C__Lanjutan.Services.Context;

namespace UAS_C__Lanjutan.Controllers.MVC
{
    public class PuzzleController : Controller
    {
        private readonly PuzzleService _puzzleService;
        private readonly GameService _dataWebService;

        public PuzzleController()
        {
            _puzzleService = new PuzzleService();
            _dataWebService = new GameService();
        }

        // GET: Puzzle (Main Menu Puzzle)
        public ActionResult Index()
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Account");

            int userId = Convert.ToInt32(Session["UserId"]);
            var playerInfo = _dataWebService.GetUserById(userId);
            ViewBag.PlayerInfo = playerInfo;

            return View();
        }

        [HttpGet]
        public JsonResult GetLeaderboard()
        {
            using (var db = new GameDbContext())
            {
                var topKlasik = db.Users
                    .OrderByDescending(u => u.HighScoreBb)
                    .ThenBy(u => u.UserId)
                    .Take(10)
                    .Select(u => new
                    {
                        userId = u.UserId,
                        username = u.Username,
                        avatar = u.Avatar,
                        level = u.Level,
                        score = u.HighScoreBb
                    })
                    .ToList();

                var topLevel = db.Users
                    .OrderByDescending(u => u.Level)
                    .ThenByDescending(u => u.Xp)
                    .ThenBy(u => u.UserId)
                    .Take(10)
                    .Select(u => new
                    {
                        userId = u.UserId,
                        username = u.Username,
                        avatar = u.Avatar,
                        level = u.Level,
                        xp = u.Xp
                    })
                    .ToList();

                return Json(new { success = true, topKlasik, topLevel }, JsonRequestBehavior.AllowGet);
            }
        }

        public ActionResult Classic()
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Account");

            int userId = Convert.ToInt32(Session["UserId"]);
            ViewBag.PlayerInfo = _dataWebService.GetUserById(userId);
            ViewBag.UnlockedRecipes = _dataWebService.GetUnlockedRecipesWithIngredients(userId);

            return View();
        }

        // GET: Puzzle/Adventure
        public ActionResult Adventure()
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Account");

            int userId = Convert.ToInt32(Session["UserId"]);
            ViewBag.PlayerInfo = _dataWebService.GetUserById(userId);
            ViewBag.Levels = _puzzleService.GetAdventureLevels();
            ViewBag.UserProgress = _puzzleService.GetUserAdventureProgress(userId);
            ViewBag.UnlockedRecipes = _dataWebService.GetUnlockedRecipesWithIngredients(userId);

            return View();
        }

        [HttpGet]
        public JsonResult GetUnlockedBlocks()
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." }, JsonRequestBehavior.AllowGet);

            int userId = Convert.ToInt32(Session["UserId"]);
            var blocks = _puzzleService.GetUnlockedBlocksForUser(userId);

            return Json(new { success = true, data = blocks }, JsonRequestBehavior.AllowGet);
        }

        // GET: Puzzle/PlayAdventure/{id}
        public ActionResult PlayAdventure(int id)
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Account");

            int userId = Convert.ToInt32(Session["UserId"]);
            var levels = _puzzleService.GetAdventureLevels();
            var level = levels.FirstOrDefault(l => l.LevelId == id);
            
            if (level == null)
                return HttpNotFound("Level tidak ditemukan");

            var nextLevel = levels.FirstOrDefault(l => l.LevelNumber == level.LevelNumber + 1);
            ViewBag.NextLevelId = nextLevel?.LevelId;

            ViewBag.PlayerInfo = _dataWebService.GetUserById(userId);
            ViewBag.UnlockedRecipes = _dataWebService.GetUnlockedRecipesWithIngredients(userId);
            ViewBag.LevelData = level;

            string GetAreaEmoji(int lvl) {
                if (lvl <= 20) return "🍩";
                if (lvl <= 40) return "🧁";
                if (lvl <= 60) return "🥞";
                if (lvl <= 80) return "🧇";
                if (lvl <= 100) return "🍰";
                if (lvl <= 120) return "🎂";
                if (lvl <= 140) return "🥧";
                return "🏁";
            }
            ViewBag.AreaDessertEmoji = GetAreaEmoji(level.LevelNumber);

            return View("AdventureGame");
        }

        [HttpPost]
        public JsonResult SaveScore(PuzzleSaveScoreRequest request)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi bermain telah habis, silakan login kembali!" });

            int userId = Convert.ToInt32(Session["UserId"]);
            if (request.Mode == "Classic")
            {
                // Returns true if new high score is saved
                _puzzleService.SaveClassicHighScore(userId, request.Score);
            }
            else if (request.Mode == "Adventure")
            {
                _puzzleService.SaveAdventureProgress(userId, request);
            }

            bool achUnlocked = false;
            string achName = "";
            string achKey = "";
            bool leveledUp = false;
            int newLevel = 1;

            using (var db = new GameDbContext())
            {
                var gameService = new GameService();

                if (request.Mode == "Classic" && request.Score >= 1000000)
                {
                    var unlockResult = gameService.CheckAndUnlockAchievement(userId, "RajaBlok");
                    if (unlockResult.Unlocked)
                    {
                        achUnlocked = true;
                        achName = unlockResult.AchievementName;
                        achKey = "RajaBlok";
                        leveledUp = unlockResult.LeveledUp;
                        newLevel = unlockResult.NewLevel;
                    }
                }
                else if (request.Mode == "Adventure")
                {
                    // Check bintang kejora (50 stars)
                    int totalStars = db.UserPuzzleLevels.Where(p => p.UserId == userId).Sum(p => (int?)p.Stars) ?? 0;
                    if (totalStars >= 50)
                    {
                        var unlockResult = gameService.CheckAndUnlockAchievement(userId, "BintangKejora");
                        if (unlockResult.Unlocked)
                        {
                            achUnlocked = true;
                            achName = unlockResult.AchievementName;
                            achKey = "BintangKejora";
                            leveledUp = unlockResult.LeveledUp;
                            newLevel = unlockResult.NewLevel;
                        }
                    }

                    // Check dewa dessert (finish level 150)
                    if (request.LevelId.HasValue && request.IsCompleted)
                    {
                        var lvl = db.PuzzleLevels.FirstOrDefault(l => l.LevelId == request.LevelId.Value);
                        if (lvl != null && lvl.LevelNumber == 150)
                        {
                            var unlockResult = gameService.CheckAndUnlockAchievement(userId, "DewaDessert");
                            if (unlockResult.Unlocked)
                            {
                                achUnlocked = true;
                                achName = unlockResult.AchievementName;
                                achKey = "DewaDessert";
                                leveledUp = unlockResult.LeveledUp;
                                newLevel = unlockResult.NewLevel;
                            }
                        }
                    }
                }
            }

            // Always fetch updated user info to update UI
            var userTerupdate = _dataWebService.GetUserById(userId);

            return Json(new
            {
                success = true,
                message = "Progress disimpan!",
                highScoreBB = userTerupdate.HighScoreBb, // assuming high_score_bb maps to HighScoreBb in User entity
                totalKoin = userTerupdate.TotalCoins,
                achievementUnlocked = achUnlocked,
                achievementName = achName,
                achievementKey = achKey,
                leveledUp = leveledUp,
                newLevel = newLevel
            });
        }

        // ====================================================================
        // FITUR GAME MABAR (DUEL 1 VS 1 MULTIPLAYER)
        // ====================================================================

        [HttpPost]
        public JsonResult PingPresence()
        {
            if (Session["UserId"] == null)
                return Json(new { success = false });

            int userId = Convert.ToInt32(Session["UserId"]);
            using (var db = new GameDbContext())
            {
                var user = db.Users.Find(userId);
                if (user != null)
                {
                    user.LastActive = DateTime.Now;
                    db.SaveChanges();
                }

                // Cek apakah ada undangan mabar masuk (status Pending dan < 30 detik lalu)
                var cutoff = DateTime.Now.AddSeconds(-30);
                var invite = db.MabarInvitations
                               .Where(i => i.ReceiverUserId == userId && i.Status == "Pending" && i.CreatedAt >= cutoff)
                               .OrderByDescending(i => i.CreatedAt)
                               .FirstOrDefault();

                if (invite != null)
                {
                    var sender = db.Users.Find(invite.SenderUserId);
                    var room = db.MabarRooms.Find(invite.RoomId);
                    if (sender != null && room != null && (room.Status == "Waiting" || room.Status == "Ready"))
                    {
                        return Json(new
                        {
                            success = true,
                            hasInvite = true,
                            inviteId = invite.Id,
                            roomId = invite.RoomId,
                            roomCode = room.RoomCode,
                            senderName = sender.Username,
                            senderAvatar = sender.Avatar ?? "/Content/Images/default-avatar.png",
                            targetScore = room.TargetScore,
                            timeLimit = room.TimeLimitSeconds
                        });
                    }
                }
            }

            return Json(new { success = true, hasInvite = false });
        }

        [HttpGet]
        public JsonResult GetOnlineFriends()
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." }, JsonRequestBehavior.AllowGet);

            int userId = Convert.ToInt32(Session["UserId"]);
            using (var db = new GameDbContext())
            {
                // Ambil daftar teman yang statusnya Accepted
                var friendIds = db.UserFriends
                                  .Where(f => (f.UserId == userId || f.FriendUserId == userId) && f.Status == "Accepted")
                                  .Select(f => f.UserId == userId ? f.FriendUserId : f.UserId)
                                  .ToList();

                var cutoff = DateTime.Now.AddSeconds(-35); // 35 detik terakhir dianggap online
                var friends = db.Users
                                .Where(u => friendIds.Contains(u.UserId) && !u.IsDeleted)
                                .Select(u => new
                                {
                                    userId = u.UserId,
                                    username = u.Username,
                                    avatar = u.Avatar ?? "/Content/Images/default-avatar.png",
                                    level = u.Level,
                                    highScore = u.HighScoreBb,
                                    isOnline = u.LastActive.HasValue && u.LastActive.Value >= cutoff
                                })
                                .OrderByDescending(u => u.isOnline)
                                .ThenBy(u => u.username)
                                .ToList();

                return Json(new { success = true, friends }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult CreateMabarRoom()
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." });

            int userId = Convert.ToInt32(Session["UserId"]);
            using (var db = new GameDbContext())
            {
                // Batalkan room sebelumnya yang masih 'Waiting' oleh user ini
                var oldRooms = db.MabarRooms.Where(r => r.HostUserId == userId && r.Status == "Waiting").ToList();
                foreach (var r in oldRooms) r.Status = "Cancelled";

                Random rand = new Random();
                int[] targetScores = { 800, 1000, 1200, 1500 };
                int chosenTarget = targetScores[rand.Next(targetScores.Length)];

                string code = "MBR" + rand.Next(1000, 9999);

                var room = new MabarRoom
                {
                    RoomCode = code,
                    HostUserId = userId,
                    GuestUserId = null,
                    TargetScore = chosenTarget,
                    TimeLimitSeconds = 180, // 3 Menit
                    Status = "Waiting",
                    CreatedAt = DateTime.Now
                };

                db.MabarRooms.Add(room);
                db.SaveChanges();

                return Json(new
                {
                    success = true,
                    roomId = room.RoomId,
                    roomCode = room.RoomCode,
                    targetScore = room.TargetScore,
                    timeLimit = room.TimeLimitSeconds
                });
            }
        }

        [HttpPost]
        public JsonResult InviteFriendMabar(int roomId, int friendUserId)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." });

            int userId = Convert.ToInt32(Session["UserId"]);
            using (var db = new GameDbContext())
            {
                var room = db.MabarRooms.Find(roomId);
                if (room == null || room.HostUserId != userId)
                    return Json(new { success = false, message = "Room tidak valid!" });

                // Batalkan invite pending sebelumnya untuk room ini
                var oldInvites = db.MabarInvitations.Where(i => i.RoomId == roomId && i.Status == "Pending").ToList();
                foreach (var i in oldInvites) i.Status = "Expired";

                var invite = new MabarInvitation
                {
                    RoomId = roomId,
                    SenderUserId = userId,
                    ReceiverUserId = friendUserId,
                    Status = "Pending",
                    CreatedAt = DateTime.Now
                };

                db.MabarInvitations.Add(invite);
                db.SaveChanges();

                return Json(new { success = true, message = "Undangan mabar berhasil dikirim! 💌" });
            }
        }

        [HttpPost]
        public JsonResult RespondMabarInvite(int inviteId, bool accept)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." });

            int userId = Convert.ToInt32(Session["UserId"]);
            using (var db = new GameDbContext())
            {
                var invite = db.MabarInvitations.Find(inviteId);
                if (invite == null || invite.ReceiverUserId != userId)
                    return Json(new { success = false, message = "Undangan tidak valid." });

                if (!accept)
                {
                    invite.Status = "Rejected";
                    db.SaveChanges();
                    return Json(new { success = true, accepted = false });
                }

                var room = db.MabarRooms.Find(invite.RoomId);
                if (room == null || room.Status == "Cancelled" || room.Status == "Finished")
                {
                    invite.Status = "Expired";
                    db.SaveChanges();
                    return Json(new { success = false, message = "Room sudah tidak tersedia atau dibatalkan." });
                }

                invite.Status = "Accepted";
                room.GuestUserId = userId;
                room.Status = "Ready";
                db.SaveChanges();

                return Json(new { success = true, accepted = true, roomId = room.RoomId });
            }
        }

        [HttpPost]
        public JsonResult JoinMabarRoomByCode(string roomCode)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." });

            int userId = Convert.ToInt32(Session["UserId"]);
            using (var db = new GameDbContext())
            {
                if (string.IsNullOrWhiteSpace(roomCode))
                    return Json(new { success = false, message = "Kode room tidak boleh kosong." });

                roomCode = roomCode.Trim().ToUpper();
                var room = db.MabarRooms.FirstOrDefault(r => r.RoomCode == roomCode && (r.Status == "Waiting" || r.Status == "Ready"));
                if (room == null)
                    return Json(new { success = false, message = "Room tidak ditemukan atau sudah dimulai/selesai." });

                if (room.HostUserId == userId)
                    return Json(new { success = true, roomId = room.RoomId, isHost = true });

                if (room.GuestUserId.HasValue && room.GuestUserId != userId)
                    return Json(new { success = false, message = "Room sudah penuh (maksimal 2 pemain)." });

                room.GuestUserId = userId;
                room.Status = "Ready";
                db.SaveChanges();

                return Json(new { success = true, roomId = room.RoomId, isHost = false });
            }
        }

        [HttpGet]
        public JsonResult GetMabarRoomStatus(int roomId)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." }, JsonRequestBehavior.AllowGet);

            int userId = Convert.ToInt32(Session["UserId"]);
            using (var db = new GameDbContext())
            {
                var room = db.MabarRooms.Find(roomId);
                if (room == null)
                    return Json(new { success = false, message = "Room tidak ditemukan." }, JsonRequestBehavior.AllowGet);

                var host = db.Users.Find(room.HostUserId);
                var guest = room.GuestUserId.HasValue ? db.Users.Find(room.GuestUserId.Value) : null;
                var winner = room.WinnerUserId.HasValue ? db.Users.Find(room.WinnerUserId.Value) : null;

                // Hitung sisa waktu jika sedang bertanding
                int secondsLeft = room.TimeLimitSeconds;
                if (room.Status == "Playing" && room.StartedAt.HasValue)
                {
                    var elapsed = (int)(DateTime.Now - room.StartedAt.Value).TotalSeconds;
                    secondsLeft = Math.Max(0, room.TimeLimitSeconds - elapsed);

                    // Jika waktu habis saat sedang bermain, otomatis tentukan pemenang
                    if (secondsLeft <= 0 && room.Status == "Playing")
                    {
                        room.Status = "Finished";
                        room.FinishedAt = DateTime.Now;
                        if (room.HostScore > room.GuestScore) room.WinnerUserId = room.HostUserId;
                        else if (room.GuestScore > room.HostScore) room.WinnerUserId = room.GuestUserId;
                        else room.WinnerUserId = null; // Seri
                        db.SaveChanges();
                    }
                }

                return Json(new
                {
                    success = true,
                    roomId = room.RoomId,
                    roomCode = room.RoomCode,
                    status = room.Status,
                    targetScore = room.TargetScore,
                    timeLimit = room.TimeLimitSeconds,
                    secondsLeft = secondsLeft,
                    host = new
                    {
                        userId = host?.UserId,
                        username = host?.Username,
                        avatar = host?.Avatar ?? "/Content/Images/default-avatar.png",
                        score = room.HostScore
                    },
                    guest = guest == null ? null : new
                    {
                        userId = guest.UserId,
                        username = guest.Username,
                        avatar = guest.Avatar ?? "/Content/Images/default-avatar.png",
                        score = room.GuestScore
                    },
                    winnerUserId = room.WinnerUserId,
                    winnerUsername = winner?.Username,
                    isHost = (room.HostUserId == userId)
                }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult StartMabarMatch(int roomId)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." });

            int userId = Convert.ToInt32(Session["UserId"]);
            using (var db = new GameDbContext())
            {
                var room = db.MabarRooms.Find(roomId);
                if (room == null || room.HostUserId != userId)
                    return Json(new { success = false, message = "Hanya pembuat room yang dapat memulai!" });

                if (!room.GuestUserId.HasValue)
                    return Json(new { success = false, message = "Menunggu teman bergabung ke room terlebih dahulu." });

                room.Status = "Playing";
                room.StartedAt = DateTime.Now;
                room.HostScore = 0;
                room.GuestScore = 0;
                room.WinnerUserId = null;
                db.SaveChanges();

                return Json(new { success = true, message = "Pertandingan dimulai!" });
            }
        }

        [HttpPost]
        public JsonResult UpdateMabarScore(int roomId, int score, bool isBoardLocked)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false });

            int userId = Convert.ToInt32(Session["UserId"]);
            using (var db = new GameDbContext())
            {
                var room = db.MabarRooms.Find(roomId);
                if (room == null || room.Status != "Playing")
                    return Json(new { success = false });

                bool isHost = (room.HostUserId == userId);
                if (isHost) room.HostScore = score;
                else if (room.GuestUserId == userId) room.GuestScore = score;

                // Cek apakah mencapai target skor
                if (score >= room.TargetScore)
                {
                    room.Status = "Finished";
                    room.WinnerUserId = userId;
                    room.FinishedAt = DateTime.Now;
                }
                else if (isBoardLocked)
                {
                    // Papan penuh dan tidak bisa bergerak -> Lawan dinyatakan menang
                    room.Status = "Finished";
                    room.WinnerUserId = isHost ? room.GuestUserId : room.HostUserId;
                    room.FinishedAt = DateTime.Now;
                }

                db.SaveChanges();

                return Json(new
                {
                    success = true,
                    status = room.Status,
                    hostScore = room.HostScore,
                    guestScore = room.GuestScore,
                    winnerUserId = room.WinnerUserId
                });
            }
        }

        [HttpPost]
        public JsonResult CancelOrLeaveMabar(int roomId)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false });

            int userId = Convert.ToInt32(Session["UserId"]);
            using (var db = new GameDbContext())
            {
                var room = db.MabarRooms.Find(roomId);
                if (room != null)
                {
                    if (room.Status == "Playing")
                    {
                        // Menyerah / forfeit saat sedang bertanding
                        room.Status = "Finished";
                        room.WinnerUserId = (room.HostUserId == userId) ? room.GuestUserId : room.HostUserId;
                        room.FinishedAt = DateTime.Now;
                    }
                    else if (room.HostUserId == userId)
                    {
                        room.Status = "Cancelled";
                    }
                    else if (room.GuestUserId == userId)
                    {
                        room.GuestUserId = null;
                        room.Status = "Waiting";
                    }
                    db.SaveChanges();
                }
            }

            return Json(new { success = true });
        }

        // GET: Puzzle/Mabar?roomId=123
        public ActionResult Mabar(int? roomId)
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Account");

            if (!roomId.HasValue)
                return RedirectToAction("Index", "Puzzle");

            int userId = Convert.ToInt32(Session["UserId"]);
            using (var db = new GameDbContext())
            {
                var room = db.MabarRooms.Find(roomId.Value);
                if (room == null || (room.HostUserId != userId && room.GuestUserId != userId))
                    return RedirectToAction("Index", "Puzzle");

                var playerInfo = db.Users.Find(userId);
                int opponentId = (room.HostUserId == userId) ? (room.GuestUserId ?? 0) : room.HostUserId;
                var opponentInfo = opponentId > 0 ? db.Users.Find(opponentId) : null;

                ViewBag.Room = room;
                ViewBag.PlayerInfo = playerInfo;
                ViewBag.OpponentInfo = opponentInfo;
                ViewBag.IsHost = (room.HostUserId == userId);

                return View();
            }
        }
    }
}
