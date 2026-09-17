using System;
using System.Web.Mvc;

namespace UAS_C__Lanjutan.Controllers.MVC
{
    public class ErrorController : Controller
    {
        // GET: /Error/Unauthorized (401)
        public ActionResult Unauthorized()
        {
            Response.StatusCode = 401;
            return View();
        }

        // GET: /Error/Forbidden (403)
        public ActionResult Forbidden()
        {
            Response.StatusCode = 403;
            return View();
        }

        // GET: /Error/NotFound (404)
        public ActionResult NotFound()
        {
            Response.StatusCode = 404;
            return View();
        }

        // GET: /Error/ServerError (500)
        public ActionResult ServerError()
        {
            Response.StatusCode = 500;
            return View();
        }
    }
}
