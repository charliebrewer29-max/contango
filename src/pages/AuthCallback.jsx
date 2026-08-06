import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { safeReturnTo } from "@/lib/authReturnTo";

// Fallback OAuth callback handler for native-shell (Capacitor) deployments.
// The platform's OAuth flow redirects back with ?access_token=… (app-params.js
// persists it before the SDK initializes). In a hosted web build the redirect
// lands on the app root directly; in a native shell a deep-link callback can
// land on /auth/callback instead. This page normalizes the handoff — the
// token is already captured — and routes to the safe return destination with
// a replace so the token doesn't linger in the address bar.
export default function AuthCallback() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(safeReturnTo(), { replace: true });
  }, [navigate]);
  return null;
}