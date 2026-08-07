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
