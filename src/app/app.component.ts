import { Component, inject, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './core/auth/auth.service';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { AppToastComponent } from './shared/components/app-toast/app-toast.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, AppToastComponent],
})
export class AppComponent implements OnInit {
  constructor() {}

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit() {
    // Escuta retornos de esquemas customizados (ex: forja://auth-callback?token=XYZ)
    App.addListener('appUrlOpen', async (data) => {
      if (data.url.includes('auth-callback')) {
        // Fecha o navegador externo
        await Browser.close();

        // Extrai parâmetros da URL
        const url = new URL(data.url);
        const idToken = url.searchParams.get('idToken') || url.searchParams.get('code');

        if (idToken) {
          this.authService.loginWithGoogleToken(idToken);
        }
      }
    });
  }
  
}
