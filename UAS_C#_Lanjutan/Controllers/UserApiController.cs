using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using UAS_C__Lanjutan.Helpers;
using UAS_C__Lanjutan.Services.Context;

namespace UAS_C__Lanjutan.Controllers
{
    [TokenAuth]
    public class UserApiController : ApiController
    {
        [HttpGet]
        [Route("api/user/profile")]
        public IHttpActionResult GetProfile()
        {
            var authHeader = Request.Headers.Authorization;
            if (authHeader == null || authHeader.Scheme != "Bearer" || string.IsNullOrEmpty(authHeader.Parameter))
            {
                return ResponseMessage(Request.CreateResponse(HttpStatusCode.Unauthorized, new {
                    success = false,
                    message = "Header Authorization Bearer token tidak ditemukan! ❌"
                }));
            }

            var token = authHeader.Parameter;
            var username = AuthController.GetUsernameByToken(token);

            if (string.IsNullOrEmpty(username))
            {
                return ResponseMessage(Request.CreateResponse(HttpStatusCode.Unauthorized, new {
                    success = false,
                    message = "Token salah, kedaluwarsa, atau tidak valid! ❌"
                }));
            }

            using (var db = new GameDbContext())
            {
                var user = db.Users.FirstOrDefault(u => u.Username == username);
                if (user == null)
                {
                    return NotFound();
                }

                return Ok(new
                {
                    success = true,
                    message = "Berhasil memuat profil pemain! 🧁",
                    data = new
                    {
                        userId = user.UserId,
                        username = user.Username,
                        email = user.Email,
                        coins = user.TotalCoins,
                        highScore = user.HighScoreBb,
                        avatar = user.Avatar ?? "default",
                        createdAt = user.CreatedAt
                    }
                });
            }
        }
    }
}
