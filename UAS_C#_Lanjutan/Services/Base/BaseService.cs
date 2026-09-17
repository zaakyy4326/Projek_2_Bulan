using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using UAS_C__Lanjutan.Services.Context;

namespace UAS_C__Lanjutan.Services.Base
{
    public class BaseService
    {
        public GameDbContext context;
        public BaseService()
        {
            context = new GameDbContext();
        }
    }
}