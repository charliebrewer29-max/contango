import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { isNativeShell } from '@/lib/platform';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// On the hosted web build, serverUrl: '' keeps API calls same-origin (relative),
// avoiding CORS entirely. Inside a Capacitor native shell the page origin is
// capacitor://localhost, so relative calls fail — point the SDK at the absolute
// app base URL instead. Web behaviour is unchanged.
const serverUrl = isNativeShell() ? appBaseUrl : '';

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl,
  requiresAuth: false,
  appBaseUrl
});