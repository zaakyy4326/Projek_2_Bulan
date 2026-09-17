using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace UAS_C__Lanjutan
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            // Jalankan alter table secara otomatis jika kolom belum ada di database SQL Server
            try
            {
                using (var db = new Services.Context.GameDbContext())
                {
                    db.Database.ExecuteSqlCommand("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'avatar') ALTER TABLE users ADD avatar VARCHAR(255) NULL;");
                    db.Database.ExecuteSqlCommand("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'last_username_change') ALTER TABLE users ADD last_username_change DATETIME NULL;");
                    db.Database.ExecuteSqlCommand("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'is_deleted') ALTER TABLE users ADD is_deleted BIT NOT NULL DEFAULT 0;");
                    db.Database.ExecuteSqlCommand("IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('users') AND name = 'deleted_at') ALTER TABLE users ADD deleted_at DATETIME NULL;");
                    db.Database.ExecuteSqlCommand("IF EXISTS (SELECT * FROM sys.tables WHERE name = 'ShopProducts') AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ShopProducts') AND name = 'IsDeleted') ALTER TABLE ShopProducts ADD IsDeleted BIT NOT NULL DEFAULT 0;");
                    db.Database.ExecuteSqlCommand("IF EXISTS (SELECT * FROM sys.tables WHERE name = 'ShopProducts') AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ShopProducts') AND name = 'DeletedAt') ALTER TABLE ShopProducts ADD DeletedAt DATETIME NULL;");
                }
            }
            catch (Exception ex)
            {
                // Log error if any, but do not block app startup
                System.Diagnostics.Debug.WriteLine("Database schema migration error: " + ex.Message);
            }
        }
    }
}
