// Detects whether the app is running inside a Capacitor native shell
// (iOS/Android bundle) vs. the hosted web build. Used to switch API calls from
// same-origin relative (web) to an absolute base URL (native), since the native
// page origin is capacitor://localhost and relative requests would fail.
export function isNativeShell() {
  if (typeof window === 'undefined') return false;
  if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function') {
    try {
      return window.Capacitor.isNativePlatform();
    } catch (e) {
      // fall through to protocol check
    }
  }
  const proto = (window.location && window.location.protocol) || '';
  return proto === 'capacitor:' || proto === 'ionic:';
}

// Build a from_url the platform can redirect back to after OAuth. In a web
// build a relative path is fine (same-origin). In a Capacitor native shell the
// page origin is capacitor://localhost, so a relative "/" would make the
// platform redirect to its own web origin instead of the native app — the
// user would land on the hosted web build, not the installed app. Return an
// absolute URL (native origin + path) so the deep-link callback returns here.
export function nativeAwareFromUrl(path = "/") {
  if (isNativeShell()) {
    return window.location.origin + path;
  }
  return path;
}