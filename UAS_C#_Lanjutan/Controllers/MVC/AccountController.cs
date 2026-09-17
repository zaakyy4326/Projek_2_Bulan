using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using UAS_C__Lanjutan.Services.Context;

namespace UAS_C__Lanjutan.Controllers.MVC
{
    public class AccountController : Controller
    {
        // GET: Account/Login
        public ActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public ActionResult SetLoginSession(int userId)
        {
            using (var db = new GameDbContext())
            {
                var user = db.Users.FirstOrDefault(u => u.UserId == userId && !u.IsDeleted);
                if (user != null)
                {
                    Session["UserId"] = user.UserId;
                    Session["Username"] = user.Username;
                    Session["Role"] = string.IsNullOrEmpty(user.Role) ? "User" : user.Role;
                    return Json(new { success = true, role = Session["Role"] });
                }
            }
            Session["UserId"] = userId;
            Session["Role"] = "User";
            return Json(new { success = true });
        }

        // GET: Account/Logout
        public ActionResult Logout()
        {
            Session.Clear();
            Session.Abandon();
            if (Request.Cookies["ASP.NET_SessionId"] != null)
            {
                Response.Cookies["ASP.NET_SessionId"].Value = string.Empty;
                Response.Cookies["ASP.NET_SessionId"].Expires = DateTime.Now.AddMonths(-20);
            }
            return RedirectToAction("Login");
        }
    }
}