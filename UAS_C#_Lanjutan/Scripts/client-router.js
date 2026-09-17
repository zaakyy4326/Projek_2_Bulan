/**
 * ==============================================================================
 * KYU'S DESSERT WORLD - CLIENT SIDE ROUTING & ROUTE GUARD
 * Sesuai Ketentuan Poin 3:
 * - Public Route
 * - Private Route
 * - Role Route (berdasarkan role Admin vs User)
 * - Redirect otomatis ketika tidak memiliki hak akses (401 / 403 / Login)
 * ==============================================================================
 */

var AppRouter = (function () {
    // 1. DAFTAR RUTE PUBLIK (Dapat diakses tanpa login)
    var publicRoutes = [
        "/",
        "/account/login",
        "/users/create",
        "/error/unauthorized",
        "/error/forbidden",
        "/error/notfound",
        "/error/servererror"
    ];

    // 2. DAFTAR RUTE PRIVAT (Wajib login / memiliki token auth)
    var privateRoutePrefixes = [
        "/mainmenu",
        "/puzzle",
        "/shop",
        "/recipes"
    ];

    // 3. DAFTAR RUTE BERBASIS ROLE (RBAC)
    var roleRoutes = [
        {
            prefix: "/users",
            requiredRole: "Admin",
            exceptions: ["/users/create"] // Registrasi publik dikecualikan
        }
    ];

    // Helper: Cek token auth di localStorage
    function getAuthToken() {
        return localStorage.getItem("authToken");
    }

    // Helper: Cek role pengguna di localStorage
    function getUserRole() {
        return localStorage.getItem("userRole") || "User";
    }

    // Helper: Validasi rute saat halaman dimuat (Guard)
    function validateCurrentRoute() {
        var path = window.location.pathname.toLowerCase();
        if (path.length > 1 && path.endsWith("/")) {
            path = path.substring(0, path.length - 1);
        }

        // Cek Pengecualian Rute Publik
        var isPublic = publicRoutes.some(function (r) {
            return path === r || path === r + "/index";
        });

        if (isPublic) {
            return; // Lolos, rute publik
        }

        // Cek Role Route (misal: /users hanya untuk Admin)
        for (var i = 0; i < roleRoutes.length; i++) {
            var rr = roleRoutes[i];
            var isException = rr.exceptions && rr.exceptions.some(function (ex) { return path.indexOf(ex) === 0; });
            if (!isException && path.indexOf(rr.prefix) === 0) {
                var currentRole = getUserRole();
                if (currentRole.toLowerCase() !== rr.requiredRole.toLowerCase()) {
                    console.warn("[AppRouter] Akses ditolak! Diperlukan role: " + rr.requiredRole + ", saat ini: " + currentRole);
                    window.location.href = "/Error/Forbidden";
                    return;
                }
            }
        }

        // Cek Private Route (Wajib terautentikasi)
        var isPrivate = privateRoutePrefixes.some(function (p) {
            return path.indexOf(p) === 0;
        });

        if (isPrivate) {
            var token = getAuthToken();
            if (!token) {
                console.warn("[AppRouter] Belum login! Mengarahkan ke halaman login...");
                window.location.href = "/Account/Login?returnUrl=" + encodeURIComponent(window.location.pathname);
                return;
            }
        }
    }

    // Client-side Navigation helper
    function navigate(url) {
        if (!url) return;
        window.location.href = url;
    }

    // Eksekusi Route Guard saat DOM siap
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", validateCurrentRoute);
    } else {
        validateCurrentRoute();
    }

    return {
        navigate: navigate,
        getAuthToken: getAuthToken,
        getUserRole: getUserRole,
        validateCurrentRoute: validateCurrentRoute
    };
})();
