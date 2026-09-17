using System.Web;
using System.Web.Mvc;

namespace UAS_C__Lanjutan
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }
    }
}
