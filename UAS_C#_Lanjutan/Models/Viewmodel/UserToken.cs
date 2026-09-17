using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace UAS_C__Lanjutan.Models
{
    public class UserToken
    {
        public string Token { get; set; }
        public DateTime Expiry { get; set; }
    }
}