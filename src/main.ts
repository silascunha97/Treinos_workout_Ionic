import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { initNativeUrlDetection } from './app/core/utils/native-url.util';

// Resolve emulador x device físico ANTES de bootstrar o app — `toNativeUrl()`
// (usada pelo Apollo e pelo login do Google) precisa dessa informação de
// forma síncrona depois, e ambos são configurados durante o bootstrap.
initNativeUrlDetection().finally(() => {
  bootstrapApplication(AppComponent, {
    providers: [
      ...appConfig.providers,
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
      provideIonicAngular(),
    ],
  });
});
