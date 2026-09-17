using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Web;
using System.Web.Mvc;
using UAS_C__Lanjutan.Models.Entity;
using UAS_C__Lanjutan.Services.Context;
using UAS_C__Lanjutan.Helpers;
using System.Text.RegularExpressions;

namespace UAS_C__Lanjutan.Controllers.MVC
{
    public class UsersController : Controller
    {
        private readonly GameDbContext db = new GameDbContext();

        private ActionResult CheckAdminAccess()
        {
            if (Session["UserId"] == null)
            {
                return RedirectToAction("Unauthorized", "Error");
            }
            var role = Session["Role"]?.ToString();
            if (!string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                return RedirectToAction("Forbidden", "Error");
            }
            return null;
        }

        // GET: Users (Admin Only)
        public ActionResult Index()
        {
            var authCheck = CheckAdminAccess();
            if (authCheck != null) return authCheck;

            return View(db.Users.Where(u => !u.IsDeleted).ToList());
        }

        // GET: Users/Details/5 (Admin Only)
        public ActionResult Details(int? id)
        {
            var authCheck = CheckAdminAccess();
            if (authCheck != null) return authCheck;

            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            User user = db.Users.Find(id);
            if (user == null)
            {
                return HttpNotFound();
            }
            return View(user);
        }

        // GET: Users/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: Users/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "UserId,Username,Email,Password,TotalCoins,HighScoreBb,CreatedAt")] User user)
        {
            if (ModelState.IsValid)
            {
                // 1. VALIDASI USERNAME KEMBAR
                var isUsernameExist = db.Users.Any(u => u.Username.ToLower() == user.Username.ToLower());
                if (isUsernameExist)
                {
                    ModelState.AddModelError("Username", "Username sudah dipakai! Silakan cari nama lain.");
                    return View(user);
                }

                // ====================================================================
                // TAMBAHKAN VALIDASI BARU INI: CEK EMAIL KEMBAR AGAR TIDAK CRASH!
                // ====================================================================
                if (string.IsNullOrWhiteSpace(user.Email) ||
                    !Regex.IsMatch(user.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$") ||
                    !user.Email.Trim().ToLower().EndsWith("@gmail.com"))
                {
                    ModelState.AddModelError("Email", "Format email tidak valid! Harus menggunakan akun @gmail.com.");
                    return View(user);
                }

                var isEmailExist = db.Users.Any(u => u.Email.ToLower() == user.Email.ToLower());
                if (isEmailExist)
                {
                    ModelState.AddModelError("Email", "Email ini sudah terdaftar! Gunakan email lain atau silakan login.");
                    return View(user);
                }

                // 2. VALIDASI PASSWORD: MINIMAL 8 KARAKTER, HARUS ADA HURUF DAN ANGKA
                if (string.IsNullOrEmpty(user.Password) || user.Password.Length < 8 ||
                    !user.Password.Any(char.IsLetter) || !user.Password.Any(char.IsDigit))
                {
                    ModelState.AddModelError("Password", "Password minimal 8 karakter dan wajib kombinasi huruf & angka!");
                    return View(user);
                }

                // Jika semua lolos validasi, baru simpan ke database
                user.TotalCoins = 0;
                user.HighScoreBb = 0;
                user.CreatedAt = DateTime.Now;
                user.Password = PasswordHelper.HashPassword(user.Password);

                db.Users.Add(user);
                db.SaveChanges();
                // BERIKAN RESEP AWAL OTOMATIS

                db.UserRecipes.Add(new UserRecipe
                {
                    UserId = user.UserId,
                    RecipeId = 1, // Donat
                    UnlockedAt = DateTime.Now
                });

                db.UserRecipes.Add(new UserRecipe
                {
                    UserId = user.UserId,
                    RecipeId = 2, // Es Krim
                    UnlockedAt = DateTime.Now
                });

                db.SaveChanges();

                // Kirim notifikasi registrasi ke email
                try
                {
                    SendRegistrationNotification(user.Email, user.Username);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine("Gagal mengirim email registrasi: " + ex.Message);
                }

                // ==================================================

                TempData["RegisSukses"] = true;

                return RedirectToAction("Login", "Account");
            }

            return View(user);
        }

        [HttpPost]
        public ActionResult RequestOtp(string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return Json(new { success = false, message = "Email tidak boleh kosong!" });
            }

            // Cari player berdasarkan email di database
            var player = db.Users.FirstOrDefault(u => u.Email == email);
            if (player == null)
            {
                return Json(new { success = false, message = "Email tidak terdaftar di sistem game!" });
            }

            // Generate 6 digit angka acak unik
            Random rand = new Random();
            string ranOtp = rand.Next(100000, 999999).ToString();

            // Simpan kode OTP ini sementara ke database player tersebut (berlaku 2 menit)
            player.OtpCode = ranOtp;
            player.OtpExpiry = DateTime.Now.AddMinutes(2);
            db.Entry(player).State = System.Data.Entity.EntityState.Modified;
            db.SaveChanges();

            // Jalankan fungsi pengiriman email asli
            try
            {
                SendOtpToRealEmail(player.Email, ranOtp, player.Username);
                return Json(new { success = true, message = "Kode OTP berhasil dikirim ke email kamu! Masa berlaku 2 menit. 🧁" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Gagal mengirim email: " + ex.Message });
            }
        }

        // ====================================================================
        // ENDPOINT 2: VERIFY OTP & RESET PASSWORD
        // ====================================================================
        [HttpPost]
        public ActionResult ResetPasswordWithOtp(string email, string otp, string newPassword)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(otp) || string.IsNullOrEmpty(newPassword))
            {
                return Json(new { success = false, message = "Semua kolom inputan wajib diisi!" });
            }

            var player = db.Users.FirstOrDefault(u => u.Email == email);
            if (player == null)
            {
                return Json(new { success = false, message = "Email tidak terdaftar!" });
            }

            // Cek masa berlaku OTP (2 menit)
            if (string.IsNullOrEmpty(player.OtpCode) || !player.OtpExpiry.HasValue || DateTime.Now > player.OtpExpiry.Value)
            {
                player.OtpCode = null;
                player.OtpExpiry = null;
                db.Entry(player).State = System.Data.Entity.EntityState.Modified;
                db.SaveChanges();
                return Json(new { success = false, message = "Kode OTP telah kedaluwarsa (berlaku 2 menit)! Silakan minta kode baru. ⏰" });
            }

            // Cari user berdasarkan email dan kode OTP yang cocok
            if (player.OtpCode != otp)
            {
                return Json(new { success = false, message = "Kode OTP salah atau tidak valid! ❌" });
            }

            // Jika OTP cocok, ubah password lama menjadi password baru
            player.Password = newPassword;
            player.OtpCode = null;
            player.OtpExpiry = null;

            db.Entry(player).State = System.Data.Entity.EntityState.Modified;
            db.SaveChanges();

            return Json(new { success = true, message = "Password kamu berhasil diperbarui! Silakan masuk kembali. ✨" });
        }

        // ====================================================================
        // HELPER METHOD: ENGINE PENGIRIMAN EMAIL SMTP ASLI
        // ====================================================================
        private void SendOtpToRealEmail(string targetEmail, string otpCode, string username)
        {
            // Pengaturan Akun Email Pengirim (Gunakan Gmail atau Mailtrap)
            var senderEmail = new MailAddress("kyuja735@gmail.com", "Dessert Game Team 🧁");
            var receiverEmail = new MailAddress(targetEmail);

            // PENTING: Jika pakai Gmail, isi ini dengan "App Password" 16 digit dari Google Account Security kamu, bukan password email biasa!
            const string smtpPassword = "dhmjvivypueavzzd";

            var sub = "Kode OTP Reset Password Dessert Game 🔑";
            var body = $@"
                <div style='font-family: ""Fredoka"", sans-serif, Arial; padding: 25px; background-color: #FFFEF7; border-radius: 20px; border: 3px solid #D4A373; max-width: 500px; margin: 0 auto; color: #7B5B3A;'>
                    <h2 style='color: #B5835A; text-align: center; margin-bottom: 5px;'>🧁 DESSERT GAME</h2>
                    <p style='text-align: center; font-size: 14px; margin-top: 0; color: #8B6B42;'>Makan Kue, Kumpulkan Koin! 🍨</p>
                    <hr style='border: 1px dashed #D4A373; margin: 20px 0;' />
                    <p>Halo <strong>{username}</strong>,</p>
                    <p>Kami menerima permintaan untuk melakukan pengaturan ulang sandi akun game kamu.</p>
                    <p>Silakan gunakan kode verifikasi OTP rahasia di bawah ini:</p>
                    <div style='background-color: #FAEDCD; border-radius: 12px; font-size: 32px; font-weight: bold; color: #FF5C8A; letter-spacing: 6px; text-align: center; padding: 15px 0; margin: 25px 0; border: 1.5px solid #D4A373;'>
                        {otpCode}
                    </div>
                    <p style='font-size: 12px; color: #8B6B42; line-height: 1.6;'>*Kode OTP ini hanya berlaku untuk satu kali sesi pemulihan akun. Jangan bagikan kode ini kepada siapa pun demi keamanan aset koin dan skor tinggi kamu.</p>
                </div>";

            var smtp = new SmtpClient
            {
                Host = "smtp.gmail.com",
                Port = 587,
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(senderEmail.Address, smtpPassword)
            };

            using (var message = new MailMessage(senderEmail, receiverEmail) { Subject = sub, Body = body, IsBodyHtml = true })
            {
                smtp.Send(message);
            }
        }

        private void SendRegistrationNotification(string targetEmail, string username)
        {
            var senderEmail = new MailAddress("kyuja735@gmail.com", "Dessert Game Team 🧁");
            var receiverEmail = new MailAddress(targetEmail);
            const string smtpPassword = "dhmjvivypueavzzd";

            var sub = "Selamat Datang di Kyu's Dessert World! 🧁✨";
            var body = $@"
                 <div style='font-family: sans-serif; padding: 25px; background-color: #FFFEF7; border-radius: 20px; border: 3px solid #D4A373; max-width: 500px; margin: 0 auto; color: #7B5B3A;'>
                     <h2 style='color: #B5835A; text-align: center; margin-bottom: 5px;'>🧁 DESSERT GAME</h2>
                     <p style='text-align: center; font-size: 14px; margin-top: 0; color: #8B6B42;'>Makan Kue, Kumpulkan Koin! 🍨</p>
                     <hr style='border: 1px dashed #D4A373; margin: 20px 0;' />
                     <p>Halo <strong>{username}</strong>,</p>
                     <p>Selamat! Akun email ini ({targetEmail}) telah berhasil terdaftar ke <strong>KYU'S DESSERT WORLD</strong>. 🎉</p>
                     <p>Sekarang kamu sudah bisa masuk ke dalam game, menjual kue-kue lezat, memecahkan teka-teki puzzle, dan mengumpulkan koin toko sebanyak-banyaknya! 🍩🍰</p>
                     <p style='margin-top: 25px; font-weight: bold; text-align: center; color: #FF5C8A;'>Selamat Bermain! 🎮🧁</p>
                 </div>";

            var smtp = new SmtpClient
            {
                Host = "smtp.gmail.com",
                Port = 587,
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(senderEmail.Address, smtpPassword)
            };

            using (var message = new MailMessage(senderEmail, receiverEmail) { Subject = sub, Body = body, IsBodyHtml = true })
            {
                smtp.Send(message);
            }
        }

        // GET: Users/Edit/5 (Admin Only)
        public ActionResult Edit(int? id)
        {
            var authCheck = CheckAdminAccess();
            if (authCheck != null) return authCheck;

            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            User user = db.Users.Find(id);
            if (user == null)
            {
                return HttpNotFound();
            }
            return View(user);
        }

        // POST: Users/Edit/5 (Admin Only)
        // To protect from overposting attacks, enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "UserId,Username,Password,TotalCoins,HighScoreBb,CreatedAt,Role,Email,Level,Xp,Avatar,PlayTimeSeconds,IsDeleted")] User user)
        {
            var authCheck = CheckAdminAccess();
            if (authCheck != null) return authCheck;

            if (ModelState.IsValid)
            {
                db.Entry(user).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(user);
        }

        // GET: Users/Delete/5 (Admin Only)
        public ActionResult Delete(int? id)
        {
            var authCheck = CheckAdminAccess();
            if (authCheck != null) return authCheck;

            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            User user = db.Users.Find(id);
            if (user == null)
            {
                return HttpNotFound();
            }
            return View(user);
        }

        // POST: Users/Delete/5 (Soft Delete) (Admin Only)
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            var authCheck = CheckAdminAccess();
            if (authCheck != null) return authCheck;

            User user = db.Users.Find(id);
            if (user != null)
            {
                user.IsDeleted = true;
                user.DeletedAt = DateTime.Now;
                db.Entry(user).State = EntityState.Modified;
                db.SaveChanges();
            }
            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
