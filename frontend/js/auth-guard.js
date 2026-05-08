/**
 * auth-guard.js
 * Include this as the FIRST script in <body> on any protected page.
 *
 * Usage:
 *   Student-only page  → <script>const REQUIRED_ROLE = 'student';</script><script src="js/auth-guard.js"></script>
 *   Admin-only page    → <script>const REQUIRED_ROLE = 'admin';</script>  <script src="js/auth-guard.js"></script>
 *   Any logged-in page → <script>const REQUIRED_ROLE = 'any';</script>    <script src="js/auth-guard.js"></script>
 */
(function () {
    const email = localStorage.getItem('loggedEmail');
    const role  = localStorage.getItem('loggedRole');

    // Not logged in → home page
    if (!email) {
        window.location.replace('index.html');
        return;
    }

    // Wrong role → redirect to correct page
    if (typeof REQUIRED_ROLE !== 'undefined' && REQUIRED_ROLE !== 'any') {
        if (role !== REQUIRED_ROLE) {
            window.location.replace(role === 'admin' ? 'admin.html' : 'notices.html');
            return;
        }
    }

    // Prevent back-button re-entry after logout
    history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', function () {
        if (!localStorage.getItem('loggedEmail')) {
            window.location.replace('index.html');
        } else {
            history.pushState(null, '', window.location.href);
        }
    });
})();
