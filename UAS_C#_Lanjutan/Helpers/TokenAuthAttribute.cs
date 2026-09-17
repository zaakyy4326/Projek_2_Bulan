
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using UAS_C__Lanjutan.Controllers;


namespace UAS_C__Lanjutan.Helpers
{
    public class TokenAuthAttribute : AuthorizationFilterAttribute
    {
        public override void OnAuthorization(HttpActionContext actionContext)
        {
            var authHeader = actionContext.Request.Headers.Authorization;
            if (authHeader == null || authHeader.Scheme != "Bearer")
            {
                actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized, "Missing Bearer token");
                return;
            }

            var token = authHeader.Parameter;
            var checkToken = AuthController.ValidateTokenCheck(token);
            if (checkToken == 0)
            {
                actionContext.Response = actionContext.Request.CreateResponse(
                    HttpStatusCode.Unauthorized, 
                    new { success = false, message = "Token salah, kedaluwarsa, atau tidak valid! ❌" }
                );
            }

            //if (!AuthController.ValidateToken(token))
            //{
            //    actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized, "Invalid token");
            //}
        }
    }
}