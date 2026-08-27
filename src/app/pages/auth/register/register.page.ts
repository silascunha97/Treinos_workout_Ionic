import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { AuthService } from '../../../core/auth/auth.service';

/** Validador de grupo: garante que `senha` e `confirmarSenha` sejam iguais. */
function senhasIguaisValidator(group: AbstractControl): ValidationErrors | null {
  const senha = group.get('senha')?.value;
  const confirmarSenha = group.get('confirmarSenha')?.value;
  return senha === confirmarSenha ? null : { senhasDiferentes: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, IonContent, IonIcon, IonSpinner, CommonModule, ReactiveFormsModule],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);

  showPassword = signal<boolean>(false);

  registerForm = this.fb.nonNullable.group(
    {
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required, Validators.minLength(6)]],
    },
    { validators: senhasIguaisValidator }
  );

  constructor() {
    addIcons({ chevronBackOutline, eyeOutline, eyeOffOutline });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { nome, email, senha } = this.registerForm.getRawValue();
    this.authService.register({ nome, email, senha }).subscribe();
  }
}
