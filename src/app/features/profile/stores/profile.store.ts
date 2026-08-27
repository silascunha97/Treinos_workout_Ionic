import { Injectable, computed, inject, signal } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import {
  HistoricoTreinoResumo,
  PerfilEstatisticas,
  PerfilUsuario,
  PerfilVolumeMensal,
} from '../models/profile.model';

export type ProfileStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface ProfileState {
  status: ProfileStatus;
  usuario: PerfilUsuario | null;
  estatisticas: PerfilEstatisticas | null;
  historico: HistoricoTreinoResumo[];
  volumeMensal: PerfilVolumeMensal | null;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileStore {
  private readonly profileService = inject(ProfileService);

  // Estado privado editável apenas internamente
  private readonly state = signal<ProfileState>({
    status: 'idle',
    usuario: null,
    estatisticas: null,
    historico: [],
    volumeMensal: null,
    error: null,
  });

  // Selectors públicos somente leitura (Readonly Computed Signals)
  readonly status = computed(() => this.state().status);
  readonly usuario = computed(() => this.state().usuario);
  readonly estatisticas = computed(() => this.state().estatisticas);
  readonly historico = computed(() => this.state().historico);
  readonly volumeMensal = computed(() => this.state().volumeMensal);
  readonly error = computed(() => this.state().error);

  readonly isLoading = computed(() => {
    const status = this.state().status;
    return status === 'idle' || status === 'loading';
  });

  /** Carrega (ou recarrega) os dados do Perfil. */
  carregar(): void {
    this.state.update((prev) => ({ ...prev, status: 'loading', error: null }));

    this.profileService.getPerfilCompleto().subscribe({
      next: ({ usuario, estatisticas, historico, volumeMensal }) => {
        this.state.set({ status: 'loaded', usuario, estatisticas, historico, volumeMensal, error: null });
      },
      error: () => {
        this.state.update((prev) => ({
          ...prev,
          status: 'error',
          error: 'Não foi possível carregar o perfil.',
        }));
      },
    });
  }
}
