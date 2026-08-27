import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonButton,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, barbell, logoGoogle } from 'ionicons/icons';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthStore } from '../../../core/auth/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonIcon,
    // IonButton,
    IonSpinner,
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);

  showPassword = signal<boolean>(false);

  // Cobre tanto erro de submit do formulário (AuthService) quanto sessão
  // expirada detectada por um 401 em qualquer request GraphQL (AuthStore —
  // ver core/graphql/apollo.config.ts).
  readonly mensagemErro = computed(() => this.authService.errorMessage() ?? this.authStore.error());

  // Formulário Reativo
  loginForm = this.fb.nonNullable.group({
    email: ['Exemplo@mail.com.com', [Validators.required, Validators.email]],
    senha: ['12345678', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline, barbell, logoGoogle });
  }

  togglePasswordVisibility() {
    this.showPassword.update((value) => !value);
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials = this.loginForm.getRawValue();
    this.authService.login(credentials).subscribe();
  }

  loginWithGoogle() {
    // Integração futura com OAuth Google
    this.authService.loginWithGoogle();
    console.log('Login com Google acionado');
  }
}