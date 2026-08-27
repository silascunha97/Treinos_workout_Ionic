import { Injectable, computed, signal } from '@angular/core';

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  user: UserProfile | null;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  // Estado privado editável apenas internamente
  private readonly state = signal<AuthState>({
    status: 'idle',
    user: null,
    error: null,
  });

  // Selectors públicos somente leitura (Readonly Computed Signals)
  readonly status = computed(() => this.state().status);
  readonly user = computed(() => this.state().user);
  readonly error = computed(() => this.state().error);

  readonly isAuthenticated = computed(() => this.state().status === 'authenticated');
  readonly isLoading = computed(() => this.state().status === 'loading');

  // Reducers para alteração de estado
  setLoading(): void {
    this.state.update((prev) => ({
      ...prev,
      status: 'loading',
      error: null,
    }));
  }

  setAuthenticated(user: UserProfile): void {
    this.state.set({
      status: 'authenticated',
      user,
      error: null,
    });
  }

  setUnauthenticated(error: string | null = null): void {
    this.state.set({
      status: 'unauthenticated',
      user: null,
      error,
    });
  }

  setError(error: string): void {
    this.state.update((prev) => ({
      ...prev,
      status: 'unauthenticated',
      error,
    }));
  }
}