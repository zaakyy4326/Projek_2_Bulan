using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace UAS_C__Lanjutan.Models.Viewmodel
{
    public class ResetPasswordRequest
    {
        public string Email { get; set; }
        public string Otp { get; set; }
        public string NewPassword { get; set; }
    }
}