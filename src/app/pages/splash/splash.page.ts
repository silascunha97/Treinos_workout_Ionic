import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { barbell } from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import { StorageService } from '../../core/native/storage.service';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule, IonContent, IonSpinner, IonIcon],
  template: `
    <ion-content color="dark" class="ion-padding">
      <div class="min-h-full flex flex-col items-center justify-center text-center">
        <div class="w-20 h-20 bg-volt rounded-full flex items-center justify-center mb-6 shadow-xl shadow-volt/20 animate-pulse">
          <ion-icon name="barbell" class="text-4xl text-dark-bg -rotate-45"></ion-icon>
        </div>
        <h1 class="text-2xl font-black text-white tracking-wider uppercase mb-2">FORJA</h1>
        <ion-spinner name="crescent" color="primary" class="mt-4"></ion-spinner>
      </div>
    </ion-content>
  `,
})
export class SplashPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);

  constructor() {
    addIcons({ barbell });
  }

  async ngOnInit() {
    const isAuthenticated = await this.authService.checkSession();
    const hasSeenOnboarding = await this.storageService.get<boolean>('has_completed_onboarding');

    setTimeout(() => {
      if (isAuthenticated) {
        this.router.navigate(['/tabs/home'], { replaceUrl: true });
      } else if (hasSeenOnboarding) {
        this.router.navigate(['/auth/login'], { replaceUrl: true });
      } else {
        this.router.navigate(['/onboarding'], { replaceUrl: true });
      }
    }, 1000);
  }
}