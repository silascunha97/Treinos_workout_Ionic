import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonIcon, IonModal, IonSkeletonText, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForward, flame, play, refresh, trashOutline } from 'ionicons/icons';
import { AuthStore } from '../../core/auth/auth.store';
import { AppButtonComponent } from '../../shared/components/app-button/app-button.component';
import { StatBadgeComponent } from '../../shared/components/stat-badge/stat-badge.component';
import { WeightPipe } from '../../shared/pipes/weight.pipe';
import { GetEvolucaoVolumeGQL, GetHomeDashboardGQL } from '../../graphql/generated/graphql';
import { SyncPillComponent } from '../../features/workout/components/sync-pill/sync-pill.component';
import { formatClock, WorkoutStore } from '../../features/workout/stores/workout.store';

type DashboardStatus = 'idle' | 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-tab-home',
  standalone: true,
  imports: [IonContent, IonHeader, IonIcon, IonModal, IonSkeletonText, IonToolbar, RouterLink, WeightPipe, AppButtonComponent, StatBadgeComponent, SyncPillComponent],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly workoutStore = inject(WorkoutStore);
  private readonly homeDashboardGql = inject(GetHomeDashboardGQL);
  private readonly evolucaoVolumeGql = inject(GetEvolucaoVolumeGQL);

  readonly usuario = this.authStore.user;
  readonly session = this.workoutStore.session;
  readonly recovered = this.workoutStore.recovered;
  readonly elapsedSec = this.workoutStore.elapsedSec;

  readonly status = signal<DashboardStatus>('idle');

  // treinoHoje/suaSemana/ultimoTreino vêm da query `GetHomeDashboard`
  // (treinoHoje, suaSemana, ultimoTreino — nenhuma delas recebe id de
  // usuário: o backend identifica quem pergunta pelo JWT).
  readonly treinoHoje = signal<{ id: string; titulo: string; quantidadeExercicios: number; exerciciosResumo: string } | null>(null);
  readonly suaSemana = signal<{
    treinosRealizados: number;
    treinosMeta: number;
    volumeSemanalTon: number;
    variacaoVolumePercentual: number;
    frequenciaPercentual: number;
    seriesSemana: number;
  } | null>(null);
  readonly ultimoTreino = signal<{ id: string; titulo: string; quando: string; duracaoMinutos: number | null; volumeTotalTon: number } | null>(null);

  readonly evolucaoVolume = signal<{ label: string; value: number }[]>([]);
  readonly volumeMaximo = computed(() => Math.max(1, ...this.evolucaoVolume().map((v) => v.value)));

  readonly confirmarDescarte = signal(false);
  readonly formatClock = formatClock;

  readonly inicialNome = computed(() => (this.usuario()?.nome?.trim()?.charAt(0) ?? '').toUpperCase());

  constructor() {
    addIcons({ play, flame, chevronForward, refresh, trashOutline });
  }

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.status.set('loading');
    this.homeDashboardGql.fetch({ fetchPolicy: 'network-only' }).subscribe({
      next: ({ data, error }) => {
        // Com `errorPolicy: 'all'` (ver apollo.config.ts), um erro do
        // GraphQL (ex.: token expirado -> UNAUTHENTICATED) chega aqui como
        // um `next` normal com `data` vazio e `error` preenchido — NÃO como
        // um erro de Observable. Sem este `if`, esse caminho não caía nem no
        // sucesso nem no `error:` abaixo, deixando `status` travado em
        // 'loading' (skeleton) para sempre.
        if (!data || error) {
          this.status.set('error');
          return;
        }
        this.treinoHoje.set(data.treinoHoje ?? null);
        this.suaSemana.set(data.suaSemana);
        this.ultimoTreino.set(data.ultimoTreino ?? null);
        this.status.set('loaded');
      },
      error: () => this.status.set('error'),
    });

    this.evolucaoVolumeGql.fetch({ fetchPolicy: 'network-only' }).subscribe({
      next: ({ data }) => {
        if (!data) return;
        this.evolucaoVolume.set(data.evolucaoVolume.map((v) => ({ label: v.semana, value: v.volumeTon })));
      },
    });
  }

  continuarTreino(): void {
    this.workoutStore.dismissRecovery();
    this.router.navigateByUrl('/tabs/workout');
  }

  descartarSessao(): void {
    this.workoutStore.discardSession();
    this.confirmarDescarte.set(false);
  }

  iniciarTreino(): void {
    this.router.navigateByUrl('/tabs/workout');
  }
}
