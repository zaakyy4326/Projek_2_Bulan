using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Web;
using System.Web.Http;
using UAS_C__Lanjutan.Models;
using UAS_C__Lanjutan.Models.Viewmodel;
using UAS_C__Lanjutan.Services.Context;
using UAS_C__Lanjutan.Helpers;

namespace UAS_C__Lanjutan.Controllers
{
    public class AuthController : ApiController
    {
        // Tempat menyimpan token sementara di memori server agar awet selama testing
        private static ConcurrentDictionary<string, UserToken> userTokens = new ConcurrentDictionary<string, UserToken>();

        [HttpPost]
        [Route("api/auth/login")]
        public IHttpActionResult Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Username dan password harus diisi!");
            }

            try
            {
                // 1. Kita panggil koneksi database kita
                using (var db = new GameDbContext())
                {
                    // AKUN TESTING INJECTION
                    if (request.Username == "zakysetiawan" && request.Password == "zakyAdmin")
                    {
                        var testingAcc = db.Users.FirstOrDefault(u => u.Username == "zakysetiawan");
                        if (testingAcc == null)
                        {
                            testingAcc = new UAS_C__Lanjutan.Models.Entity.User
                            {
                                Username = "zakysetiawan",
                                Password = PasswordHelper.HashPassword("zakyAdmin"),
                                Email = "zakytesting@gmail.com",
                                TotalCoins = 10000000,
                                HighScoreBb = 0,
                                Role = "Admin",
                                CreatedAt = DateTime.Now
                            };
                            db.Users.Add(testingAcc);
                            db.SaveChanges();
                        }
                        else
                        {
                            bool modified = false;
                            if (testingAcc.TotalCoins < 10000000)
                            {
                                testingAcc.TotalCoins = 10000000;
                                modified = true;
                            }
                            if (testingAcc.Role != "Admin")
                            {
                                testingAcc.Role = "Admin";
                                modified = true;
                            }
                            if (modified)
                            {
                                db.Entry(testingAcc).State = System.Data.Entity.EntityState.Modified;
                                db.SaveChanges();
                            }
                        }
                    }

                    string hashedPassword = PasswordHelper.HashPassword(request.Password.Trim());

                    var reqUser = request.Username.Trim();
                    var userLolos = db.Users.FirstOrDefault(
                        u => u.Username.Trim() == reqUser &&
                             u.Password == hashedPassword);

                    if (userLolos == null)
                    {
                        return Unauthorized();
                    }

                    if (userLolos.IsDeleted)
                    {
                        return BadRequest("Akun ini telah dinonaktifkan.");
                    }

                    // ====================================================================
                    // TAMBAHKAN BARIS INI: Isi Session MVC dari dalam Web API
                    // ====================================================================
                    if (HttpContext.Current != null && HttpContext.Current.Session != null)
                    {
                        HttpContext.Current.Session["UserId"] = userLolos.UserId;
                        HttpContext.Current.Session["Username"] = userLolos.Username;
                        HttpContext.Current.Session["Role"] = string.IsNullOrEmpty(userLolos.Role) ? "User" : userLolos.Role;
                    }

                    var token = Guid.NewGuid().ToString();
                    var userToken = new UserToken
                    {
                        Token = token,
                        Expiry = DateTime.UtcNow.AddDays(365 * 99)
                    };

                    userTokens[request.Username] = userToken;

                    return Ok(new
                    {
                        token = token,
                        username = userLolos.Username,
                        role = string.IsNullOrEmpty(userLolos.Role) ? "User" : userLolos.Role,
                        coins = userLolos.TotalCoins,
                        highScore = userLolos.HighScoreBb,
                        userId = userLolos.UserId
                    });
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception("Gagal terhubung ke database: " + ex.Message, ex));
            }
        }

        // Fungsi pengecekan token untuk dipakai oleh Satpam (TokenAuthAttribute)
        public static int ValidateTokenCheck(string token)
        {
            var match = userTokens.Values.FirstOrDefault(t => t.Token == token);
            return match == null ? 0 : 1;
        }

        // Fungsi mendapatkan username berdasarkan token yang tersimpan di memori server
        public static string GetUsernameByToken(string token)
        {
            var match = userTokens.FirstOrDefault(kvp => kvp.Value != null && kvp.Value.Token == token);
            return match.Key; // Mengembalikan username atau null
        }


        [HttpPost]
        [Route("api/auth/request-otp")]
        public IHttpActionResult RequestOtp([FromBody] string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return BadRequest("Email tidak boleh kosong!");
            }

            // 1. Panggil koneksi database sesuai arsitektur kamu
            using (var db = new GameDbContext())
            {
                // Bersihkan OTP yang sudah kedaluwarsa di sistem agar tidak tersangkut di database
                try
                {
                    db.Database.ExecuteSqlCommand("UPDATE users SET OtpCode = NULL, otp_expiry = NULL WHERE otp_expiry IS NOT NULL AND otp_expiry < GETDATE()");
                }
                catch { }

                // 2. Cari player berdasarkan email
                var player = db.Users.FirstOrDefault(u => u.Email.ToLower() == email.ToLower());
                if (player == null)
                {
                    return BadRequest("Email tidak terdaftar di sistem game!");
                }

                // 3. Generate 6 digit angka acak unik
                Random rand = new Random();
                string ranOtp = rand.Next(100000, 999999).ToString();

                // 4. Simpan kode OTP ke database player dengan masa aktif 2 menit
                player.OtpCode = ranOtp;
                player.OtpExpiry = DateTime.Now.AddMinutes(2);
                db.Entry(player).State = System.Data.Entity.EntityState.Modified;
                db.SaveChanges();

                // 5. Jalankan engine pengiriman email asli
                try
                {
                    SendOtpToRealEmail(player.Email, ranOtp, player.Username);

                    // UBAH BARIS RETURN INI:
                    return ResponseMessage(Request.CreateResponse(HttpStatusCode.OK, new
                    {
                        success = true,
                        message = "Kode OTP berhasil dikirim ke email kamu! Masa berlaku 2 menit. 🧁"
                    }));
                }
                catch (Exception ex)
                {
                    return ResponseMessage(Request.CreateResponse(HttpStatusCode.InternalServerError, new
                    {
                        success = false,
                        message = "Gagal mengirim email: " + ex.Message
                    }));
                }
            }
        }

        [HttpPost]
        [Route("api/auth/reset-password")]
        public IHttpActionResult ResetPasswordWithOtp([FromBody] ResetPasswordRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Otp) || string.IsNullOrEmpty(request.NewPassword))
            {
                return BadRequest("Semua kolom inputan wajib diisi!");
            }

            using (var db = new GameDbContext())
            {
                // 1. Cari user berdasarkan email
                var player = db.Users.FirstOrDefault(u => u.Email.ToLower() == request.Email.ToLower());
                if (player == null)
                {
                    return BadRequest("Email tidak terdaftar di sistem game!");
                }

                // 2. Cek apakah OTP kedaluwarsa (masa berlaku 2 menit)
                if (string.IsNullOrEmpty(player.OtpCode) || !player.OtpExpiry.HasValue || DateTime.Now > player.OtpExpiry.Value)
                {
                    player.OtpCode = null;
                    player.OtpExpiry = null;
                    db.Entry(player).State = System.Data.Entity.EntityState.Modified;
                    db.SaveChanges();
                    return BadRequest("Kode OTP telah kedaluwarsa (berlaku 2 menit)! Silakan minta kode OTP baru. ⏰");
                }

                // 3. Cek apakah kode OTP cocok
                if (player.OtpCode != request.Otp)
                {
                    return BadRequest("Kode OTP salah atau tidak valid! ❌");
                }

                // 4. VALIDASI PASSWORD BARU
                if (request.NewPassword.Length < 8 || !request.NewPassword.Any(char.IsLetter) || !request.NewPassword.Any(char.IsDigit))
                {
                    return BadRequest("Password baru minimal 8 karakter dan wajib kombinasi huruf & angka!");
                }

                // 5. Jika lolos, ubah password lama menjadi password baru & hapus OTP dari database
                player.Password = PasswordHelper.HashPassword(request.NewPassword);
                player.OtpCode = null;
                player.OtpExpiry = null;

                db.Entry(player).State = System.Data.Entity.EntityState.Modified;
                db.SaveChanges();

                return ResponseMessage(Request.CreateResponse(HttpStatusCode.OK, new
                {
                    success = true,
                    message = "Password berhasil diperbarui! Silakan masuk kembali. ✨"
                }));
            }
        }

        [HttpPost]
        [Route("api/auth/cancel-otp")]
        public IHttpActionResult CancelOtp([FromBody] string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                return Ok(new { success = true });
            }

            using (var db = new GameDbContext())
            {
                var player = db.Users.FirstOrDefault(u => u.Email.ToLower() == email.ToLower());
                if (player != null && (!string.IsNullOrEmpty(player.OtpCode) || player.OtpExpiry.HasValue))
                {
                    player.OtpCode = null;
                    player.OtpExpiry = null;
                    db.Entry(player).State = System.Data.Entity.EntityState.Modified;
                    db.SaveChanges();
                }
            }

            return Ok(new { success = true, message = "Kode OTP berhasil dibatalkan dan dibersihkan." });
        }


        private void SendOtpToRealEmail(string targetEmail, string otpCode, string username)
        {
            var senderEmail = new MailAddress("kyuja735@gmail.com", "Dessert Game");
            var receiverEmail = new MailAddress(targetEmail);

            // PENTING: Isi dengan "App Password" 16 digit dari akun Google Security kamu
            const string smtpPassword = "dhmjvivypueavzzd";

            var sub = "Kode OTP Reset Password Dessert Game 🔑";
            var body = $@"
                <div style='font-family: sans-serif; padding: 25px; background-color: #FFFEF7; border-radius: 20px; border: 3px solid #D4A373; max-width: 500px; margin: 0 auto; color: #7B5B3A;'>
                    <h2 style='color: #B5835A; text-align: center; margin-bottom: 5px;'>🧁 DESSERT GAME</h2>
                    <p style='text-align: center; font-size: 14px; margin-top: 0; color: #8B6B42;'>Makan Kue, Kumpulkan Koin! 🍨</p>
                    <hr style='border: 1px dashed #D4A373; margin: 20px 0;' />
                    <p>Hai <strong>{username}</strong>, berikut adalah kode otp kamu:</p>
                    <div style='background-color: #FAEDCD; border-radius: 12px; font-size: 32px; font-weight: bold; color: #FF5C8A; letter-spacing: 6px; text-align: center; padding: 15px 0; margin: 25px 0; border: 1.5px solid #D4A373;'>
                        {otpCode}
                    </div>
                    <p style='font-size: 12px; color: #8B6B42; line-height: 1.6;'>*Jangan bagikan kode ini kepada siapa pun demi keamanan koin dan skor tinggi kamu.</p>
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
    }
}
