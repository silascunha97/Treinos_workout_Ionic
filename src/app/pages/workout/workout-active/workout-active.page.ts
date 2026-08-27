import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon, IonModal, IonProgressBar, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowUndoOutline,
  barbellOutline,
  checkmark,
  chevronForward,
  close,
  timerOutline,
  wifiOutline,
} from 'ionicons/icons';
import { AppButtonComponent } from '../../../shared/components/app-button/app-button.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PillComponent } from '../../../shared/components/pill/pill.component';
import { VolumePipe } from '../../../shared/pipes/volume.pipe';
import {
  ExercisePickerComponent,
  ExercisePickerResult,
} from '../../../features/workout/components/exercise-picker/exercise-picker.component';
import { RestTimerComponent } from '../../../features/workout/components/rest-timer/rest-timer.component';
import { SyncPillComponent } from '../../../features/workout/components/sync-pill/sync-pill.component';
import { formatClock, WorkoutStore } from '../../../features/workout/stores/workout.store';

@Component({
  selector: 'app-workout-active',
  standalone: true,
  imports: [IonButton, 
    IonIcon,
    IonModal,
    IonProgressBar,
    AppButtonComponent,
    EmptyStateComponent,
    PillComponent,
    VolumePipe,
    ExercisePickerComponent,
    RestTimerComponent,
    SyncPillComponent,
  ],
  templateUrl: './workout-active.page.html',
  styleUrls: ['./workout-active.page.scss'],
})
export class WorkoutPage {
  private readonly store = inject(WorkoutStore);
  private readonly router = inject(Router);

  readonly session = this.store.session;
  readonly online = this.store.online;
  readonly syncState = this.store.syncState;
  readonly elapsedSec = this.store.elapsedSec;
  readonly rest = this.store.rest;
  readonly savingSet = this.store.savingSet;

  readonly pickerAberto = signal(false);
  readonly pickerModo = signal<'create' | 'add'>('create');
  readonly sairAberto = signal(false);
  readonly finalizarAberto = signal(false);
  readonly acabouDeSalvar = signal(false);

  readonly exercicioAtual = computed(() => {
    const s = this.session();
    return s ? s.exercises[s.currentExercise] : null;
  });

  readonly indiceSerieAtual = computed(() => {
    const ex = this.exercicioAtual();
    if (!ex) return 0;
    const idx = ex.sets.findIndex((s) => !s.done);
    return idx === -1 ? ex.sets.length - 1 : idx;
  });

  readonly serieAtual = computed(() => {
    const ex = this.exercicioAtual();
    return ex ? ex.sets[this.indiceSerieAtual()] : null;
  });

  readonly todasSeries = computed(() => this.session()?.exercises.flatMap((e) => e.sets) ?? []);
  readonly seriesFeitas = computed(() => this.todasSeries().filter((s) => s.done));
  readonly volumeAtual = computed(() =>
    Math.round(this.seriesFeitas().reduce((a, s) => a + s.weight * s.reps, 0)),
  );
  readonly repeticoesFeitas = computed(() => this.seriesFeitas().reduce((a, s) => a + s.reps, 0));
  readonly progresso = computed(() => {
    const total = this.todasSeries().length;
    return total ? this.seriesFeitas().length / total : 0;
  });
  readonly exercicioConcluido = computed(() => {
    const ex = this.exercicioAtual();
    return ex ? ex.sets.every((s) => s.done) : false;
  });
  readonly proximoExercicio = computed(() => {
    const s = this.session();
    return s ? s.exercises[s.currentExercise + 1] : undefined;
  });

  readonly formatClock = formatClock;

  constructor() {
    addIcons({ barbellOutline, close, wifiOutline, addOutline, arrowUndoOutline, chevronForward, checkmark, timerOutline });
  }

  /** Consultado pelo activeWorkoutGuard (canDeactivate) em rotas que o utilizam. */
  hasActiveWorkout(): boolean {
    return Boolean(this.session());
  }

  abrirPickerNovo(): void {
    this.pickerModo.set('create');
    this.pickerAberto.set(true);
  }

  abrirPickerAdicionar(): void {
    this.pickerModo.set('add');
    this.pickerAberto.set(true);
  }

  fecharPicker(): void {
    this.pickerAberto.set(false);
  }

  confirmarPicker(resultado: ExercisePickerResult): void {
    this.pickerAberto.set(false);
    if (this.pickerModo() === 'create') {
      // No modo "add", o próprio ExercisePickerComponent já chamou
      // `store.addExercise(id, holdSec)` pra cada id antes de emitir — nada
      // a fazer aqui além de fechar o modal. `holdOnly` não é mais passado:
      // `WorkoutStore.buildSessionExercise` deriva sozinho de
      // `Exercicio.tipoExercicio` (dado real do catálogo).
      void this.store.startWorkout(resultado.ids, undefined, resultado.holds);
    }
  }

  // "Repetir último treino" existia no protótipo com uma lista de exercícios
  // fixa no código — removido: BLOCKED BY BACKEND CONTRACT. `ultimoTreino()`
  // só retorna id/título/duração/volume, não a lista de exercícios da sessão,
  // então não há como reconstruir esse treino sem inventar dados.

  ajustarCarga(delta: number): void {
    const atual = this.serieAtual();
    if (!atual) return;
    this.store.updateSet({ weight: Math.round((atual.weight + delta) * 10) / 10 });
  }

  ajustarReps(delta: number): void {
    const atual = this.serieAtual();
    if (!atual) return;
    this.store.updateSet({ reps: atual.reps + delta });
  }

  /** Liga a isometria pro exercício atual (10s padrão) — botão "Adicionar". */
  ativarHold(): void {
    const s = this.session();
    if (!s) return;
    this.store.setExerciseHold(s.currentExercise, 10);
  }

  /** "Remover" — só existe pra exercícios que já entraram híbridos (não pra `holdOnly`, ver template). */
  removerHold(): void {
    const s = this.session();
    if (!s) return;
    this.store.setExerciseHold(s.currentExercise, null);
  }

  ajustarHold(delta: number): void {
    const atual = this.serieAtual();
    if (!atual) return;
    this.store.updateSet({ holdSec: atual.holdSec + delta });
  }

  concluirSerie(): void {
    this.store.completeSet();
    this.acabouDeSalvar.set(true);
    setTimeout(() => this.acabouDeSalvar.set(false), 1400);
  }

  irParaProximo(): void {
    const s = this.session();
    if (s) this.store.goToExercise(s.currentExercise + 1);
  }

  desfazerSerie(): void {
    this.store.undoLastSet();
  }

  sairSemDescartar(): void {
    this.sairAberto.set(false);
    this.router.navigateByUrl('/tabs/home');
  }

  abandonarTreino(): void {
    this.store.discardSession();
    this.sairAberto.set(false);
    this.router.navigateByUrl('/tabs/home');
  }

  confirmarFinalizar(): void {
    this.store.finishWorkout();
    this.finalizarAberto.set(false);
    this.router.navigateByUrl('/workout/summary');
  }
}
