
(function () {
  const CHECK_API = '/api/auth/check';
  const LOGIN_PAGE = '/Login';
  const PUBLIC_ROUTES = [
   '/', '/login', '/signup', '/forgot'
  ].map(p => p.toLowerCase());

  // For comparison (for auth, and public route detection): normalize to lowercase
  const normalizePath = (p) => {
    if (!p) return '/';
    let path = p.split('?')[0].replace(/\/+$/, '').toLowerCase();
    return path === '' ? '/' : path.startsWith('/') ? path : '/' + path;
  };

  // For saving the path with original case (for restore navigation)
  const canonicalPath = (p) => {
    if (!p) return '/';
    let path = p.split('?')[0].replace(/\/+$/, '');
    return path === '' ? '/' : path.startsWith('/') ? path : '/' + path;
  };

  const isPublic = (p) => PUBLIC_ROUTES.includes(normalizePath(p));

  function saveLastGood(path) {
    try { 
      // Save with original case, not lowercased version!
      sessionStorage.setItem('lastGoodPath', canonicalPath(path)); 
    } catch (_) {}
  }

  function getLastGood() {
    try { return sessionStorage.getItem('lastGoodPath'); } catch (_) { return '/'; }
  }

  async function checkPageAccess() {
    const path = window.location.pathname;
    const normPath = normalizePath(path);

    if (isPublic(normPath)) {
      // Always save with the user's visible URL, preserving case!
      saveLastGood(path);
      return;
    }

    try {
      const res = await fetch(`${CHECK_API}?path=${encodeURIComponent(normPath)}`, { credentials: 'include' });
      if (!res.ok) throw new Error('unauthorized');
      const data = await res.json();

      if (!data.success) throw new Error('unauthorized');

      if (data.hasAccess) {
        // User has access; save original case URL
        saveLastGood(path);
        return;
      }

      // ❌ logged-in but not allowed
      const lastGood = getLastGood() || '/';
      if (normalizePath(lastGood) === normPath) {
        window.location.replace(LOGIN_PAGE);
      } else {
        // Restore last good path WITH its original case form!
        window.location.replace(lastGood);
      }
    } catch (err) {
      // ❌ session invalid or not logged in
      window.location.replace(LOGIN_PAGE);
    }
  }

  // Run on page load
  checkPageAccess();

  // Intercept SPA navigation to make sure lastGoodPath always updated correctly
  const push = history.pushState;
  const replace = history.replaceState;

  history.pushState = function (...args) {
    const r = push.apply(this, args);
    checkPageAccess();
    return r;
  };

  history.replaceState = function (...args) {
    const r = replace.apply(this, args);
    checkPageAccess();
    return r;
  };

  window.addEventListener('popstate', checkPageAccess);
})();

