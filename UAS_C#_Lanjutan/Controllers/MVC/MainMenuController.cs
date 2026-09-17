using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using UAS_C__Lanjutan.Models.Entity;
using UAS_C__Lanjutan.Services.Context;
using UAS_C__Lanjutan.Services.Impl;

namespace UAS_C__Lanjutan.Controllers.MVC
{
    public class MainMenuController : Controller
    {
        //private GameDbContext db = new GameDbContext();

        // GET: MainMenu
        public ActionResult Index()
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Account");

            int currentUserId = Convert.ToInt32(Session["UserId"]);

            var service = new GameService();
            service.AutoSyncUserAchievements(currentUserId);

            var currentPlayer = service.GetUserById(currentUserId);

            if (currentPlayer == null)
                return RedirectToAction("Login", "Account");

            ViewBag.PlayerInfo = currentPlayer;

            using (var db = new GameDbContext())
            {
                var pinned = db.UserAchievements
                               .Where(a => a.UserId == currentUserId && a.IsPinned)
                               .Select(a => a.AchievementKey)
                               .ToList();
                ViewBag.PinnedAchievements = pinned;
            }

            return View();
        }
       

        public ActionResult Cooking()
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Account");

            int userId = Convert.ToInt32(Session["UserId"]);

            var service = new GameService();

            ViewBag.PlayerInfo = service.GetUserById(userId);

            ViewBag.UnlockedRecipes =
                service.GetUnlockedRecipesWithIngredients(userId);

            using (var db = new GameDbContext())
            {
                ViewBag.UnlockedAchievements = db.UserAchievements
                                                 .Where(a => a.UserId == userId)
                                                 .Select(a => a.AchievementKey)
                                                 .ToList();
            }

            return View();
        }

        public ActionResult RecipeBook()
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Account");

            int userId = Convert.ToInt32(Session["UserId"]);

            var service = new GameService();

            ViewBag.PlayerInfo = service.GetUserById(userId);

            ViewBag.AllRecipes =
                service.GetAllRecipesWithIngredients();

            ViewBag.UnlockedRecipeIds =
                service.GetUnlockedRecipeIds(userId);

            return View();
        }

        [HttpPost]
        public JsonResult SimpanKoinGame(int koinDidapat, bool unlockSoClose = false, string cookedItemsJson = "", int maxStreak = 0)
        {
            if (Session["UserId"] == null)
            {
                return Json(new { success = false, message = "Sesi bermain telah habis, silakan login kembali!" });
            }

            int userId = Convert.ToInt32(Session["UserId"]);
            var service = new GameService();

            // Menggunakan fungsi tambah koin yang kita buat di Langkah 2
            bool isSukses = service.TambahKoinUser(userId, koinDidapat);

            if (isSukses)
            {
                // Menggunakan fungsi GetUserById yang baru saja kita tambahkan di atas
                var userTerupdate = service.GetUserById(userId);

                bool achUnlocked = false;
                string achName = "";
                string achVoucher = "";
                bool leveledUp = false;
                int newLevel = 1;

                // Anti-cheat verification: Only unlock SoClose when session completes legitimately
                if (unlockSoClose)
                {
                    var unlockResult = service.CheckAndUnlockAchievement(userId, "SoClose");
                    if (unlockResult.Unlocked)
                    {
                        achUnlocked = true;
                        achName = unlockResult.AchievementName;
                        achVoucher = unlockResult.VoucherCode;
                        leveledUp = unlockResult.LeveledUp;
                        newLevel = unlockResult.NewLevel;
                    }
                }

                // Anti-cheat verification: Misi Harian HANYA diproses jika sesi selesai normal (waktu habis & koin disimpan)
                if (!string.IsNullOrEmpty(cookedItemsJson) || maxStreak > 0)
                {
                    using (var db = new GameDbContext())
                    {
                        DateTime today = DateTime.Today;
                        var missions = db.UserDailyMissions
                                         .Where(m => m.UserId == userId && DbFunctions.TruncateTime(m.AssignedDate) == today)
                                         .ToList();

                        // 1. Proses Menu yang Berhasil Dimasak
                        if (!string.IsNullOrEmpty(cookedItemsJson))
                        {
                            try
                            {
                                var cookedDict = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, int>>(cookedItemsJson);
                                if (cookedDict != null)
                                {
                                    foreach (var kvp in cookedDict)
                                    {
                                        foreach (var m in missions.Where(x => x.MissionType == "Cook" && !x.IsCompleted))
                                        {
                                            if (m.MenuName.Equals(kvp.Key, StringComparison.OrdinalIgnoreCase))
                                            {
                                                m.CurrentProgress = Math.Min(m.TargetProgress, m.CurrentProgress + kvp.Value);
                                                if (m.CurrentProgress >= m.TargetProgress)
                                                {
                                                    m.IsCompleted = true;
                                                }
                                                db.Entry(m).State = EntityState.Modified;
                                            }
                                        }
                                    }
                                }
                            }
                            catch { }
                        }

                        // 2. Proses Streak Pelanggan Beruntun
                        if (maxStreak > 0)
                        {
                            var streakMission = missions.FirstOrDefault(x => x.MissionType == "Streak" && !x.IsCompleted);
                            if (streakMission != null)
                            {
                                streakMission.CurrentProgress = Math.Min(streakMission.TargetProgress, Math.Max(streakMission.CurrentProgress, maxStreak));
                                if (streakMission.CurrentProgress >= streakMission.TargetProgress)
                                {
                                    streakMission.IsCompleted = true;
                                }
                                db.Entry(streakMission).State = EntityState.Modified;
                            }
                        }

                        db.SaveChanges();
                    }
                }

                return Json(new
                {
                    success = true,
                    message = "Koin hasil jualan kue berhasil disimpan! 🧁",
                    totalKoinBaru = userTerupdate.TotalCoins,
                    achievementUnlocked = achUnlocked,
                    achievementName = achName,
                    achievementVoucher = achVoucher,
                    leveledUp = leveledUp,
                    newLevel = newLevel
                });
            }

            return Json(new { success = false, message = "Gagal memperbarui data koin di server." });
        }

        [HttpPost]
        public JsonResult UnlockRecipe(int recipeId)
        {
            if (Session["UserId"] == null)
            {
                return Json(new
                {
                    success = false,
                    message = "Session habis."
                });
            }

            int userId = Convert.ToInt32(Session["UserId"]);

            var service = new GameService();

            bool result = service.UnlockRecipe(userId, recipeId);

            if (result)
            {
                using (var db = new GameDbContext())
                {
                    int unlockedCount = db.UserRecipes.Count(x => x.UserId == userId);
                    bool achUnlocked = false;
                    string achName = "";
                    bool leveledUp = false;
                    int newLevel = 1;

                    if (unlockedCount >= 8)
                    {
                        var unlockResult = service.CheckAndUnlockAchievement(userId, "MasterPastry");
                        if (unlockResult.Unlocked)
                        {
                            achUnlocked = true;
                            achName = unlockResult.AchievementName;
                            leveledUp = unlockResult.LeveledUp;
                            newLevel = unlockResult.NewLevel;
                        }
                    }
                    else if (unlockedCount >= 4)
                    {
                        var unlockResult = service.CheckAndUnlockAchievement(userId, "ChefMagang");
                        if (unlockResult.Unlocked)
                        {
                            achUnlocked = true;
                            achName = unlockResult.AchievementName;
                            leveledUp = unlockResult.LeveledUp;
                            newLevel = unlockResult.NewLevel;
                        }
                    }

                    var userTerupdate = db.Users.FirstOrDefault(u => u.UserId == userId);
                    return Json(new
                    {
                        success = true,
                        message = "Resep berhasil dibuka! ✨",
                        totalKoinBaru = userTerupdate.TotalCoins,
                        achievementUnlocked = achUnlocked,
                        achievementName = achName,
                        achievementKey = achUnlocked ? (unlockedCount >= 8 ? "MasterPastry" : "ChefMagang") : "",
                        leveledUp = leveledUp,
                        newLevel = newLevel
                    });
                }
            }

            return Json(new
            {
                success = false,
                message = "Koin tidak cukup atau resep sudah dimiliki."
            });
        }

        public PartialViewResult RecipeBookPartial()
        {
            if (Session["UserId"] == null)
                return null;

            int userId = Convert.ToInt32(Session["UserId"]);

            var service = new GameService();

            ViewBag.AllRecipes = service.GetAllRecipesWithIngredients();

            ViewBag.UnlockedRecipes = service.GetUnlockedRecipeIds(userId);

            return PartialView();
        }

        [HttpPost]
        public JsonResult UpdateUsername(string newUsername)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi telah habis, silakan login kembali." });

            if (string.IsNullOrWhiteSpace(newUsername))
                return Json(new { success = false, message = "Username tidak boleh kosong!" });

            newUsername = newUsername.Trim();

            int userId = Convert.ToInt32(Session["UserId"]);
            using (var db = new GameDbContext())
            {
                var user = db.Users.FirstOrDefault(u => u.UserId == userId);
                if (user == null)
                    return Json(new { success = false, message = "User tidak ditemukan!" });

                var exists = db.Users.Any(u => u.UserId != userId && u.Username.ToLower() == newUsername.ToLower());
                if (exists)
                    return Json(new { success = false, message = "Username sudah digunakan oleh pemain lain!" });

                if (user.LastUsernameChange.HasValue)
                {
                    var daysSinceChange = (DateTime.Now - user.LastUsernameChange.Value).TotalDays;
                    if (daysSinceChange < 7)
                    {
                        var remainingDays = Math.Ceiling(7 - daysSinceChange);
                        return Json(new { success = false, message = $"Username hanya dapat diubah sekali seminggu! Silakan coba lagi dalam {remainingDays} hari." });
                    }
                }

                user.Username = newUsername;
                user.LastUsernameChange = DateTime.Now;
                db.Entry(user).State = EntityState.Modified;
                db.SaveChanges();

                Session["Username"] = newUsername;
                return Json(new { success = true, message = "Username berhasil diperbarui! ✨" });
            }
        }

        [HttpPost]
        public JsonResult ChooseAvatar(string avatarName)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi telah habis, silakan login kembali." });

            if (string.IsNullOrEmpty(avatarName))
                return Json(new { success = false, message = "Pilih avatar terlebih dahulu!" });

            int userId = Convert.ToInt32(Session["UserId"]);
            using (var db = new GameDbContext())
            {
                var user = db.Users.FirstOrDefault(u => u.UserId == userId);
                if (user == null)
                    return Json(new { success = false, message = "User tidak ditemukan!" });

                user.Avatar = "/Content/PNG/avatar/" + avatarName;
                db.Entry(user).State = EntityState.Modified;
                db.SaveChanges();

                return Json(new { success = true, message = "Avatar berhasil diubah! 🎨", avatarUrl = user.Avatar });
            }
        }

        [HttpPost]
        public JsonResult UploadAvatar(HttpPostedFileBase avatarFile)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi telah habis, silakan login kembali." });

            if (avatarFile == null || avatarFile.ContentLength == 0)
                return Json(new { success = false, message = "Pilih file foto terlebih dahulu!" });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var extension = System.IO.Path.GetExtension(avatarFile.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
                return Json(new { success = false, message = "Format file tidak didukung! Gunakan JPG, JPEG, PNG, atau GIF." });

            if (avatarFile.ContentLength > 150 * 1024 * 1024)
                return Json(new { success = false, message = "Ukuran file terlalu besar! Maksimal 150MB." });

            int userId = Convert.ToInt32(Session["UserId"]);
            try
            {
                var uploadDir = Server.MapPath("~/Content/Uploads/");
                if (!System.IO.Directory.Exists(uploadDir))
                {
                    System.IO.Directory.CreateDirectory(uploadDir);
                }

                var fileName = $"custom_avatar_{userId}_{DateTime.Now.Ticks}{extension}";
                var path = System.IO.Path.Combine(uploadDir, fileName);
                avatarFile.SaveAs(path);

                var relativeUrl = "/Content/Uploads/" + fileName;

                using (var db = new GameDbContext())
                {
                    var user = db.Users.FirstOrDefault(u => u.UserId == userId);
                    if (user == null)
                        return Json(new { success = false, message = "User tidak ditemukan!" });

                    user.Avatar = relativeUrl;
                    db.Entry(user).State = EntityState.Modified;
                    db.SaveChanges();

                    return Json(new { success = true, message = "Foto profil berhasil diunggah! 📸", avatarUrl = relativeUrl });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Gagal mengunggah foto: " + ex.Message });
            }
        }

        [HttpPost]
        public JsonResult RequestEmailChangeOtp()
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi telah habis, silakan login kembali." });

            int userId = Convert.ToInt32(Session["UserId"]);
            using (var db = new GameDbContext())
            {
                // Bersihkan OTP kedaluwarsa di sistem
                try
                {
                    db.Database.ExecuteSqlCommand("UPDATE users SET OtpCode = NULL, otp_expiry = NULL WHERE otp_expiry IS NOT NULL AND otp_expiry < GETDATE()");
                }
                catch { }

                var user = db.Users.FirstOrDefault(u => u.UserId == userId);
                if (user == null)
                    return Json(new { success = false, message = "User tidak ditemukan!" });

                Random rand = new Random();
                string ranOtp = rand.Next(100000, 999999).ToString();

                user.OtpCode = ranOtp;
                user.OtpExpiry = DateTime.Now.AddMinutes(2);
                db.Entry(user).State = EntityState.Modified;
                db.SaveChanges();

                try
                {
                    SendEmailChangeOtp(user.Email, ranOtp, user.Username);
                    return Json(new { success = true, message = "Kode OTP berhasil dikirim ke email terdaftar kamu! Masa berlaku 2 menit. 🧁" });
                }
                catch (Exception ex)
                {
                    return Json(new { success = false, message = "Gagal mengirim email: " + ex.Message });
                }
            }
        }

        [HttpPost]
        public JsonResult VerifyAndChangeEmail(string otp, string newEmail)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi telah habis, silakan login kembali." });

            if (string.IsNullOrWhiteSpace(otp) || string.IsNullOrWhiteSpace(newEmail))
                return Json(new { success = false, message = "Semua kolom inputan wajib diisi!" });

            otp = otp.Trim();
            newEmail = newEmail.Trim();

            try
            {
                var addr = new System.Net.Mail.MailAddress(newEmail);
                if (addr.Address != newEmail) throw new Exception();
                if (!newEmail.ToLower().EndsWith("@gmail.com")) throw new Exception();
            }
            catch
            {
                return Json(new { success = false, message = "Format email baru tidak valid! Harus menggunakan akun @gmail.com." });
            }

            int userId = Convert.ToInt32(Session["UserId"]);
            using (var db = new GameDbContext())
            {
                var user = db.Users.FirstOrDefault(u => u.UserId == userId);
                if (user == null)
                    return Json(new { success = false, message = "User tidak ditemukan!" });

                // Cek masa berlaku OTP (2 menit)
                if (string.IsNullOrEmpty(user.OtpCode) || !user.OtpExpiry.HasValue || DateTime.Now > user.OtpExpiry.Value)
                {
                    user.OtpCode = null;
                    user.OtpExpiry = null;
                    db.Entry(user).State = EntityState.Modified;
                    db.SaveChanges();
                    return Json(new { success = false, message = "Kode OTP telah kedaluwarsa (berlaku 2 menit)! Silakan minta kode baru. ⏰" });
                }

                if (user.OtpCode != otp)
                    return Json(new { success = false, message = "Kode OTP salah atau tidak valid! ❌" });

                var exists = db.Users.Any(u => u.UserId != userId && u.Email.ToLower() == newEmail.ToLower());
                if (exists)
                    return Json(new { success = false, message = "Email sudah digunakan oleh pemain lain!" });

                user.Email = newEmail;
                user.OtpCode = null;
                user.OtpExpiry = null;
                db.Entry(user).State = EntityState.Modified;
                db.SaveChanges();

                // Kirim notifikasi ke email baru
                try
                {
                    SendEmailChangeNotification(newEmail, user.Username);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine("Gagal mengirim email notifikasi perubahan email: " + ex.Message);
                }

                return Json(new { success = true, message = "Email berhasil diperbarui! ✨" });
            }
        }

        [HttpPost]
        public JsonResult CancelEmailChangeOtp()
        {
            if (Session["UserId"] == null)
                return Json(new { success = true });

            int userId = Convert.ToInt32(Session["UserId"]);
            using (var db = new GameDbContext())
            {
                var user = db.Users.FirstOrDefault(u => u.UserId == userId);
                if (user != null && (!string.IsNullOrEmpty(user.OtpCode) || user.OtpExpiry.HasValue))
                {
                    user.OtpCode = null;
                    user.OtpExpiry = null;
                    db.Entry(user).State = EntityState.Modified;
                    db.SaveChanges();
                }
            }
            return Json(new { success = true, message = "Kode OTP berhasil dibatalkan dan dibersihkan." });
        }

        private void SendEmailChangeNotification(string targetEmail, string username)
        {
            var senderEmail = new System.Net.Mail.MailAddress("kyuja735@gmail.com", "Dessert Game");
            var receiverEmail = new System.Net.Mail.MailAddress(targetEmail);
            const string smtpPassword = "dhmjvivypueavzzd";

            var sub = "Notifikasi Perubahan Email Dessert Game 🧁✨";
            var body = $@"
                 <div style='font-family: sans-serif; padding: 25px; background-color: #FFFEF7; border-radius: 20px; border: 3px solid #D4A373; max-width: 500px; margin: 0 auto; color: #7B5B3A;'>
                     <h2 style='color: #B5835A; text-align: center; margin-bottom: 5px;'>🧁 DESSERT GAME</h2>
                     <p style='text-align: center; font-size: 14px; margin-top: 0; color: #8B6B42;'>Makan Kue, Kumpulkan Koin! 🍨</p>
                     <hr style='border: 1px dashed #D4A373; margin: 20px 0;' />
                     <p>Hai <strong>{username}</strong>,</p>
                     <p>Akun email ini ({targetEmail}) telah terdaftar ke <strong>KYU'S DESSERT WORLD</strong> sebagai email aktif baru kamu. 🎉</p>
                     <p>Seluruh progres game, koin, resep, dan skor tinggi kamu sekarang terikat ke email ini.</p>
                     <p style='margin-top: 25px; font-weight: bold; text-align: center; color: #FF5C8A;'>Selamat Bermain Kembali! 🎮🧁</p>
                 </div>";

            var smtp = new System.Net.Mail.SmtpClient
            {
                Host = "smtp.gmail.com",
                Port = 587,
                EnableSsl = true,
                DeliveryMethod = System.Net.Mail.SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new System.Net.NetworkCredential(senderEmail.Address, smtpPassword)
            };

            using (var message = new System.Net.Mail.MailMessage(senderEmail, receiverEmail) { Subject = sub, Body = body, IsBodyHtml = true })
            {
                smtp.Send(message);
            }
        }

        private void SendEmailChangeOtp(string targetEmail, string otpCode, string username)
        {
            var senderEmail = new System.Net.Mail.MailAddress("kyuja735@gmail.com", "Dessert Game");
            var receiverEmail = new System.Net.Mail.MailAddress(targetEmail);
            const string smtpPassword = "dhmjvivypueavzzd";

            var sub = "Kode OTP Perubahan Email Dessert Game 🔑";
            var body = $@"
                <div style='font-family: sans-serif; padding: 25px; background-color: #FFFEF7; border-radius: 20px; border: 3px solid #D4A373; max-width: 500px; margin: 0 auto; color: #7B5B3A;'>
                    <h2 style='color: #B5835A; text-align: center; margin-bottom: 5px;'>🧁 DESSERT GAME</h2>
                    <p style='text-align: center; font-size: 14px; margin-top: 0; color: #8B6B42;'>Makan Kue, Kumpulkan Koin! 🍨</p>
                    <hr style='border: 1px dashed #D4A373; margin: 20px 0;' />
                    <p>Hai <strong>{username}</strong>, kamu sedang meminta perubahan email akun game kamu.</p>
                    <p>Berikut adalah kode OTP verifikasi kamu:</p>
                    <div style='background-color: #FAEDCD; border-radius: 12px; font-size: 32px; font-weight: bold; color: #FF5C8A; letter-spacing: 6px; text-align: center; padding: 15px 0; margin: 25px 0; border: 1.5px solid #D4A373;'>
                        {otpCode}
                    </div>
                    <p style='font-size: 12px; color: #8B6B42; line-height: 1.6;'>*Jangan bagikan kode ini kepada siapa pun demi keamanan akun kamu.</p>
                </div>";

            var smtp = new System.Net.Mail.SmtpClient
            {
                Host = "smtp.gmail.com",
                Port = 587,
                EnableSsl = true,
                DeliveryMethod = System.Net.Mail.SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new System.Net.NetworkCredential(senderEmail.Address, smtpPassword)
            };

            using (var message = new System.Net.Mail.MailMessage(senderEmail, receiverEmail) { Subject = sub, Body = body, IsBodyHtml = true })
            {
                smtp.Send(message);
            }
        }

        //protected override void Dispose(bool disposing)
        //{
        //    if (disposing)
        //    {
        //        db.Dispose();
        //    }
        //    base.Dispose(disposing);
        //}

        [HttpGet]
        public JsonResult GetMisiHarian()
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." }, JsonRequestBehavior.AllowGet);

            int userId = Convert.ToInt32(Session["UserId"]);
            DateTime today = DateTime.Today;

            using (var db = new GameDbContext())
            {
                // Ambil misi harian hari ini
                var missions = db.UserDailyMissions
                                 .Where(m => m.UserId == userId && DbFunctions.TruncateTime(m.AssignedDate) == today)
                                 .OrderBy(m => m.SlotNumber)
                                 .ToList();

                if (missions.Count < 3)
                {
                    // Hapus misi lama
                    var oldMissions = db.UserDailyMissions.Where(m => m.UserId == userId).ToList();
                    db.UserDailyMissions.RemoveRange(oldMissions);
                    db.SaveChanges();

                    // Generate baru
                    var service = new GameService();
                    var unlockedRecipes = service.GetUnlockedRecipesWithIngredients(userId);
                    var unlockedNames = unlockedRecipes.Select(r => r.RecipeName).ToList();

                    if (!unlockedNames.Contains("Donat")) unlockedNames.Add("Donat");
                    if (!unlockedNames.Contains("Es Krim")) unlockedNames.Add("Es Krim");

                    Random rand = new Random();
                    string menu1 = unlockedNames[rand.Next(unlockedNames.Count)];

                    string menu2 = menu1;
                    if (unlockedNames.Count > 1)
                    {
                        var listBeda = unlockedNames.Where(n => n != menu1).ToList();
                        menu2 = listBeda[rand.Next(listBeda.Count)];
                    }

                    // Slot 1
                    var m1 = new UserDailyMission
                    {
                        UserId = userId,
                        SlotNumber = 1,
                        MissionType = "Cook",
                        MenuName = menu1,
                        TargetProgress = 5,
                        CurrentProgress = 0,
                        IsCompleted = false,
                        IsClaimed = false,
                        AssignedDate = today
                    };

                    // Slot 2
                    var m2 = new UserDailyMission
                    {
                        UserId = userId,
                        SlotNumber = 2,
                        MissionType = "Cook",
                        MenuName = menu2,
                        TargetProgress = 5,
                        CurrentProgress = 0,
                        IsCompleted = false,
                        IsClaimed = false,
                        AssignedDate = today
                    };

                    // Slot 3
                    var m3 = new UserDailyMission
                    {
                        UserId = userId,
                        SlotNumber = 3,
                        MissionType = "Streak",
                        MenuName = "Pelanggan Beruntun",
                        TargetProgress = 10,
                        CurrentProgress = 0,
                        IsCompleted = false,
                        IsClaimed = false,
                        AssignedDate = today
                    };

                    db.UserDailyMissions.Add(m1);
                    db.UserDailyMissions.Add(m2);
                    db.UserDailyMissions.Add(m3);
                    db.SaveChanges();

                    missions = new List<UserDailyMission> { m1, m2, m3 };
                }

                return Json(new { success = true, data = missions.Select(m => new {
                    id = m.Id,
                    slot = m.SlotNumber,
                    type = m.MissionType,
                    menuName = m.MenuName,
                    target = m.TargetProgress,
                    progress = m.CurrentProgress,
                    isCompleted = m.IsCompleted,
                    isClaimed = m.IsClaimed
                }) }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult UpdateMissionProgress(string type, string menuName = "", int value = 1)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." });

            int userId = Convert.ToInt32(Session["UserId"]);
            DateTime today = DateTime.Today;

            using (var db = new GameDbContext())
            {
                var missions = db.UserDailyMissions
                                 .Where(m => m.UserId == userId && DbFunctions.TruncateTime(m.AssignedDate) == today)
                                 .ToList();

                bool updated = false;

                if (type == "Cook")
                {
                    foreach (var m in missions.Where(x => x.MissionType == "Cook" && !x.IsCompleted))
                    {
                        if (m.MenuName.Equals(menuName, StringComparison.OrdinalIgnoreCase))
                        {
                            m.CurrentProgress = Math.Min(m.TargetProgress, m.CurrentProgress + value);
                            if (m.CurrentProgress >= m.TargetProgress)
                            {
                                m.IsCompleted = true;
                            }
                            db.Entry(m).State = EntityState.Modified;
                            updated = true;
                        }
                    }
                }
                else if (type == "Streak")
                {
                    var m = missions.FirstOrDefault(x => x.MissionType == "Streak");
                    if (m != null && !m.IsCompleted)
                    {
                        if (value == 0)
                        {
                            m.CurrentProgress = 0;
                        }
                        else
                        {
                            m.CurrentProgress = Math.Min(m.TargetProgress, value);
                            if (m.CurrentProgress >= m.TargetProgress)
                            {
                                m.IsCompleted = true;
                            }
                        }
                        db.Entry(m).State = EntityState.Modified;
                        updated = true;
                    }
                }

                if (updated)
                {
                    db.SaveChanges();
                    return Json(new { success = true, data = missions.Select(m => new {
                        id = m.Id,
                        slot = m.SlotNumber,
                        type = m.MissionType,
                        menuName = m.MenuName,
                        target = m.TargetProgress,
                        progress = m.CurrentProgress,
                        isCompleted = m.IsCompleted,
                        isClaimed = m.IsClaimed
                    }) });
                }

                return Json(new { success = false, message = "Misi tidak berubah atau tidak ditemukan." });
            }
        }

        [HttpPost]
        public JsonResult ClaimMissionReward(int missionId)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." });

            int userId = Convert.ToInt32(Session["UserId"]);

            using (var db = new GameDbContext())
            {
                var mission = db.UserDailyMissions.FirstOrDefault(m => m.Id == missionId && m.UserId == userId);
                if (mission == null)
                    return Json(new { success = false, message = "Misi tidak ditemukan." });

                if (!mission.IsCompleted)
                    return Json(new { success = false, message = "Misi belum selesai!" });

                if (mission.IsClaimed)
                    return Json(new { success = false, message = "Hadiah sudah diklaim sebelumnya." });

                mission.IsClaimed = true;
                db.Entry(mission).State = EntityState.Modified;

                int rewardCoins = mission.MissionType == "Streak" ? 40 : 10;
                var user = db.Users.FirstOrDefault(u => u.UserId == userId);
                if (user != null)
                {
                    user.TotalCoins += rewardCoins;
                    db.Entry(user).State = EntityState.Modified;
                }

                db.SaveChanges();

                return Json(new { success = true, message = $"Berhasil klaim {rewardCoins} Koin! 🧁", totalCoins = user?.TotalCoins ?? 0 });
            }
        }

        [HttpGet]
        public JsonResult GetBukuPencapaian()
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." }, JsonRequestBehavior.AllowGet);

            int userId = Convert.ToInt32(Session["UserId"]);

            var service = new GameService();
            service.AutoSyncUserAchievements(userId);

            using (var db = new GameDbContext())
            {
                var user = db.Users.FirstOrDefault(u => u.UserId == userId);
                if (user == null)
                    return Json(new { success = false, message = "User tidak ditemukan." }, JsonRequestBehavior.AllowGet);

                var unlocked = db.UserAchievements.Where(a => a.UserId == userId).ToList();

                var allAchievements = new[]
                {
                    new { Key = "ChefMagang", Name = "Chef Magang 🧑‍🍳", Desc = "Buka 4 Resep Kue Baru di Toko Resep", Voucher = "DK-ONGKIR10", Xp = 100 },
                    new { Key = "MasterPastry", Name = "Master Pastry Chef 👑", Desc = "Buka seluruh 8 Resep Kue di Toko Resep", Voucher = "DK-KUE15K", Xp = 300 },
                    new { Key = "SoClose", Name = "Koki Kilat ⚡", Desc = "Sajikan kue saat sisa waktu kesabaran < 3 detik", Voucher = "DK-CLOSE5K", Xp = 100 },
                    new { Key = "PlayTime", Name = "Pelanggan Setia 🕰️", Desc = "Total akumulasi waktu aktif di web selama 45 menit", Voucher = "DK-SETIA50K", Xp = 150 },
                    new { Key = "BintangKejora", Name = "Bintang Kejora ⭐", Desc = "Kumpulkan 50 Bintang di Peta Petualangan", Voucher = "DK-STAR10K", Xp = 150 },
                    new { Key = "DewaDessert", Name = "Dewa Dessert 🏁", Desc = "Selesaikan seluruh 150 Level Petualangan", Voucher = "DK-DEWA30K", Xp = 500 },
                    new { Key = "RajaBlok", Name = "Raja Blok 🧱", Desc = "Capai High Score 1.000.000 di Mode Klasik", Voucher = "DK-BLOK20", Xp = 250 }
                };

                var list = allAchievements.Select(a => {
                    var match = unlocked.FirstOrDefault(u => u.AchievementKey == a.Key);
                    string userVoucherCode = string.IsNullOrEmpty(a.Voucher) ? "" : $"{a.Voucher}-U{userId}";
                    return new {
                        key = a.Key,
                        name = a.Name,
                        desc = a.Desc,
                        voucher = userVoucherCode,
                        xp = a.Xp,
                        isUnlocked = match != null,
                        isPinned = match?.IsPinned ?? false,
                        isClaimed = match?.IsClaimed ?? false,
                        unlockedAt = match?.UnlockedAt.ToString("dd MMM yyyy HH:mm") ?? ""
                    };
                }).ToList();

                return Json(new {
                    success = true,
                    xp = user.Xp,
                    level = user.Level,
                    playTime = user.PlayTimeSeconds,
                    data = list
                }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult PinAchievement(string key)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." });

            int userId = Convert.ToInt32(Session["UserId"]);

            using (var db = new GameDbContext())
            {
                var user = db.Users.FirstOrDefault(u => u.UserId == userId);
                if (user == null)
                    return Json(new { success = false, message = "User tidak ditemukan." });

                var targetUa = db.UserAchievements.FirstOrDefault(a => a.UserId == userId && a.AchievementKey == key);
                if (targetUa == null)
                    return Json(new { success = false, message = "Pencapaian ini belum berhasil Anda buka! 🔒" });

                if (targetUa.IsPinned)
                {
                    targetUa.IsPinned = false;
                    db.Entry(targetUa).State = EntityState.Modified;
                    db.SaveChanges();
                    return Json(new { success = true, message = "Lencana berhasil dilepas dari profil! 🍃", isPinned = false });
                }

                int maxSlots = 3;

                int currentPinnedCount = db.UserAchievements.Count(a => a.UserId == userId && a.IsPinned);
                if (currentPinnedCount >= maxSlots)
                {
                    return Json(new { success = false, message = $"Slot pajangan lencana penuh! Anda hanya boleh memajang maksimal {maxSlots} lencana." });
                }

                targetUa.IsPinned = true;
                db.Entry(targetUa).State = EntityState.Modified;
                db.SaveChanges();

                return Json(new { success = true, message = "Lencana berhasil dipajang di profil! 🎗️", isPinned = true });
            }
        }

        [HttpPost]
        public JsonResult Heartbeat()
        {
            if (Session["UserId"] == null)
                return Json(new { success = false });

            int userId = Convert.ToInt32(Session["UserId"]);

            using (var db = new GameDbContext())
            {
                var user = db.Users.FirstOrDefault(u => u.UserId == userId);
                if (user == null) return Json(new { success = false });

                user.PlayTimeSeconds += 30;
                db.Entry(user).State = EntityState.Modified;
                db.SaveChanges();

                if (user.PlayTimeSeconds >= 2700)
                {
                    var service = new GameService();
                    var unlockResult = service.CheckAndUnlockAchievement(userId, "PlayTime");
                    if (unlockResult.Unlocked)
                    {
                        return Json(new { 
                            success = true, 
                            achievementUnlocked = true, 
                            achievementName = unlockResult.AchievementName,
                            achievementKey = "PlayTime",
                            xpGained = unlockResult.XpGained,
                            leveledUp = unlockResult.LeveledUp,
                            newLevel = unlockResult.NewLevel
                        });
                    }
                }

                return Json(new { success = true, playTime = user.PlayTimeSeconds });
            }
        }

        [HttpPost]
        public JsonResult TriggerAchievementSoClose()
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." });

            int userId = Convert.ToInt32(Session["UserId"]);

            using (var db = new GameDbContext())
            {
                var service = new GameService();
                var unlockResult = service.CheckAndUnlockAchievement(userId, "SoClose");
                if (unlockResult.Unlocked)
                {
                    return Json(new { 
                        success = true, 
                        unlocked = true,
                        achievementUnlocked = true,
                        name = unlockResult.AchievementName,
                        achievementName = unlockResult.AchievementName,
                        achievementKey = "SoClose",
                        xp = unlockResult.XpGained,
                        leveledUp = unlockResult.LeveledUp,
                        newLevel = unlockResult.NewLevel
                    });
                }
                return Json(new { success = true, unlocked = false });
            }
        }

        [HttpGet]
        public JsonResult GetLeaderboard()
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." }, JsonRequestBehavior.AllowGet);

            using (var db = new GameDbContext())
            {
                var topPlayers = db.Users
                                   .OrderByDescending(u => u.Level)
                                   .ThenByDescending(u => u.HighScoreBb)
                                   .Take(10)
                                   .ToList()
                                   .Select(u => new {
                                       userId = u.UserId,
                                       username = u.Username,
                                       avatar = u.Avatar,
                                       level = u.Level,
                                       highScore = u.HighScoreBb
                                   })
                                   .ToList();

                return Json(new { success = true, data = topPlayers }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult GetPublicProfile(int userId)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." }, JsonRequestBehavior.AllowGet);

            var service = new GameService();
            service.AutoSyncUserAchievements(userId);

            using (var db = new GameDbContext())
            {
                var player = db.Users.FirstOrDefault(u => u.UserId == userId);
                if (player == null)
                    return Json(new { success = false, message = "Pemain tidak ditemukan." }, JsonRequestBehavior.AllowGet);

                var pinnedAchievements = db.UserAchievements
                                           .Where(a => a.UserId == userId && a.IsPinned)
                                           .ToList()
                                           .Select(a => new {
                                               key = a.AchievementKey,
                                               name = GetAchievementNameByKey(a.AchievementKey),
                                               desc = GetAchievementDescByKey(a.AchievementKey)
                                           })
                                           .ToList();

                return Json(new {
                    success = true,
                    username = player.Username,
                    avatar = player.Avatar,
                    level = player.Level,
                    xp = player.Xp,
                    highScore = player.HighScoreBb,
                    pinned = pinnedAchievements
                }, JsonRequestBehavior.AllowGet);
            }
        }

        private string GetAchievementNameByKey(string key)
        {
            switch (key)
            {
                case "ChefMagang": return "Chef Magang 🧑‍🍳";
                case "MasterPastry": return "Master Pastry Chef 👑";
                case "SoClose": return "Koki Kilat ⚡";
                case "PlayTime": return "Pelanggan Setia 🕰️";
                case "BintangKejora": return "Bintang Kejora ⭐";
                case "DewaDessert": return "Dewa Dessert 🏁";
                case "RajaBlok": return "Raja Blok 🧱";
                default: return key;
            }
        }

        private string GetAchievementDescByKey(string key)
        {
            switch (key)
            {
                case "ChefMagang": return "Buka 4 Resep Kue Baru di Toko Resep";
                case "MasterPastry": return "Buka seluruh 8 Resep Kue di Toko Resep";
                case "SoClose": return "Sajikan kue saat sisa waktu kesabaran < 3 detik";
                case "PlayTime": return "Total akumulasi waktu aktif di web selama 45 menit";
                case "BintangKejora": return "Kumpulkan 50 Bintang di Peta Petualangan";
                case "DewaDessert": return "Selesaikan seluruh 150 Level Petualangan";
                case "RajaBlok": return "Capai High Score 1.000.000 di Mode Klasik";
                default: return "";
            }
        }

        [HttpGet]
        public JsonResult FindPlayers(string search = "")
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." }, JsonRequestBehavior.AllowGet);

            int userId = Convert.ToInt32(Session["UserId"]);

            using (var db = new GameDbContext())
            {
                var query = db.Users.Where(u => u.UserId != userId);
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(u => u.Username.Contains(search));
                }

                List<User> allPlayers;
                if (!string.IsNullOrEmpty(search))
                {
                    allPlayers = query.OrderBy(u => u.Username).Take(30).ToList();
                }
                else
                {
                    // Tampilkan rekomendasi player secara acak (bukan ranking tertinggi)
                    allPlayers = query.OrderBy(u => Guid.NewGuid()).Take(20).ToList();
                }

                var friendships = db.UserFriends
                                    .Where(f => f.UserId == userId || f.FriendUserId == userId)
                                    .ToList();

                // Pastikan player yang memiliki request pending atau pertemanan selalu terikutsertakan
                var relatedUserIds = friendships.Select(f => f.UserId == userId ? f.FriendUserId : f.UserId).Distinct().ToList();
                var relatedUsers = db.Users.Where(u => relatedUserIds.Contains(u.UserId)).ToList();
                var combinedPlayers = relatedUsers.Union(allPlayers).GroupBy(u => u.UserId).Select(g => g.First()).ToList();

                var data = combinedPlayers.Select(u => {
                    var accepted = friendships.FirstOrDefault(f => f.Status == "Accepted" && (f.UserId == u.UserId || f.FriendUserId == u.UserId));
                    var sentPending = friendships.FirstOrDefault(f => f.Status == "Pending" && f.UserId == userId && f.FriendUserId == u.UserId);
                    var receivedPending = friendships.FirstOrDefault(f => f.Status == "Pending" && f.FriendUserId == userId && f.UserId == u.UserId);

                    string statusStr = "None";
                    if (accepted != null) statusStr = "Accepted";
                    else if (sentPending != null) statusStr = "SentPending";
                    else if (receivedPending != null) statusStr = "ReceivedPending";

                    return new {
                        userId = u.UserId,
                        username = u.Username,
                        avatar = u.Avatar,
                        level = u.Level,
                        highScore = u.HighScoreBb,
                        isFriend = (accepted != null),
                        friendStatus = statusStr
                    };
                }).ToList();

                int pendingCount = friendships.Count(f => f.FriendUserId == userId && f.Status == "Pending");

                return Json(new { success = true, data = data, pendingCount = pendingCount }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpGet]
        public JsonResult GetPendingFriendRequestsCount()
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, count = 0 }, JsonRequestBehavior.AllowGet);

            int userId = Convert.ToInt32(Session["UserId"]);
            using (var db = new GameDbContext())
            {
                int count = db.UserFriends.Count(f => f.FriendUserId == userId && f.Status == "Pending");
                return Json(new { success = true, count = count }, JsonRequestBehavior.AllowGet);
            }
        }

        [HttpPost]
        public JsonResult AddFriend(int friendUserId)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." });

            int userId = Convert.ToInt32(Session["UserId"]);
            if (userId == friendUserId)
                return Json(new { success = false, message = "Anda tidak bisa menambahkan diri sendiri!" });

            using (var db = new GameDbContext())
            {
                var existing = db.UserFriends.FirstOrDefault(f => 
                    (f.UserId == userId && f.FriendUserId == friendUserId) || 
                    (f.UserId == friendUserId && f.FriendUserId == userId));

                if (existing != null)
                {
                    if (existing.Status == "Accepted")
                        return Json(new { success = true, message = "Sudah berteman!" });

                    if (existing.Status == "Pending")
                    {
                        if (existing.UserId == userId)
                            return Json(new { success = false, message = "Permintaan pertemanan sudah terkirim." });
                        else
                        {
                            existing.Status = "Accepted";
                            db.Entry(existing).State = EntityState.Modified;
                            db.SaveChanges();
                            return Json(new { success = true, message = "Permintaan diterima! Sekarang kalian berteman! 🤝" });
                        }
                    }
                }

                var newFriendship = new UserFriend
                {
                    UserId = userId,
                    FriendUserId = friendUserId,
                    Status = "Pending",
                    CreatedAt = DateTime.Now
                };
                db.UserFriends.Add(newFriendship);
                db.SaveChanges();

                return Json(new { success = true, message = "Permintaan pertemanan terkirim! ⏳" });
            }
        }

        [HttpPost]
        public JsonResult AcceptFriendRequest(int requesterUserId)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." });

            int userId = Convert.ToInt32(Session["UserId"]);

            using (var db = new GameDbContext())
            {
                var request = db.UserFriends.FirstOrDefault(f => 
                    f.UserId == requesterUserId && f.FriendUserId == userId && f.Status == "Pending");

                if (request == null)
                    return Json(new { success = false, message = "Permintaan pertemanan tidak ditemukan." });

                request.Status = "Accepted";
                db.Entry(request).State = EntityState.Modified;
                db.SaveChanges();

                return Json(new { success = true, message = "Permintaan diterima! Sekarang kalian berteman! 🤝" });
            }
        }

        [HttpPost]
        public JsonResult RejectFriendRequest(int requesterUserId)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." });

            int userId = Convert.ToInt32(Session["UserId"]);

            using (var db = new GameDbContext())
            {
                var request = db.UserFriends.FirstOrDefault(f => 
                    f.UserId == requesterUserId && f.FriendUserId == userId && f.Status == "Pending");

                if (request != null)
                {
                    db.UserFriends.Remove(request);
                    db.SaveChanges();
                }
                return Json(new { success = true, message = "Permintaan pertemanan ditolak." });
            }
        }

        [HttpPost]
        public JsonResult RemoveFriend(int friendUserId)
        {
            if (Session["UserId"] == null)
                return Json(new { success = false, message = "Sesi habis." });

            int userId = Convert.ToInt32(Session["UserId"]);

            using (var db = new GameDbContext())
            {
                var friendship = db.UserFriends.FirstOrDefault(f => 
                    ((f.UserId == userId && f.FriendUserId == friendUserId) || 
                     (f.UserId == friendUserId && f.FriendUserId == userId)) && f.Status == "Accepted");

                if (friendship != null)
                {
                    db.UserFriends.Remove(friendship);
                    db.SaveChanges();
                }
                return Json(new { success = true, message = "Berhasil menghapus teman." });
            }
        }
    }
}
