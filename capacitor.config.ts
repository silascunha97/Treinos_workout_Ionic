import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ionic-app',
  webDir: 'www',
  // O app é servido pelo Capacitor via `https://localhost`, mas o GraphQL de
  // dev (environment.ts) é `http://10.0.2.2:4000` (sem TLS — não existe cert
  // pra um backend local). Sem isso, o WebView bloqueia a chamada como
  // "Mixed Content" (HTTPS pedindo HTTP) mesmo com `usesCleartextTraffic`
  // habilitado no AndroidManifest.xml — são duas políticas independentes:
  // uma é do SO (permite socket cleartext), a outra é do próprio motor
  // Chromium do WebView (permite XHR de origem HTTP a partir de página
  // HTTPS), e só essa segunda é controlada por `android.allowMixedContent`.
  // Não é um risco de segurança em produção: lá o backend real serve HTTPS
  // (environment.prod.ts), então não há mixed content a bloquear mesmo com
  // a flag ligada.
  android: {
    allowMixedContent: true
  }
};

// Live-reload: `npx cap run android` trava no Windows ("'gradlew' não é
// reconhecido") por causa de um bug conhecido do @capacitor/cli ao invocar o
// gradlew.bat via cross-spawn. Como workaround, o build/instalação são feitos
// manualmente (ver .vscode/tasks.json) e a URL do dev server é injetada aqui
// via env var antes do `cap sync`, em vez de usar a flag `-l` do `cap run`.
if (process.env['IONIC_LIVE_RELOAD_URL']) {
  config.server = {
    url: process.env['IONIC_LIVE_RELOAD_URL'],
    cleartext: true
  };
}

export default config;
