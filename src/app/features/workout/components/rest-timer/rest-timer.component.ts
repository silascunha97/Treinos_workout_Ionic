import { Component, computed, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmark, pause, play, playSkipForward, add } from 'ionicons/icons';
import { formatClock, WorkoutStore } from '../../stores/workout.store';

/** Tela cheia de descanso entre séries — anel circular de progresso + controles. */
@Component({
  selector: 'app-rest-timer',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './rest-timer.component.html',
})
export class RestTimerComponent {
  private readonly store = inject(WorkoutStore);

  readonly rest = this.store.rest;
  readonly restControls = this.store.restControls;

  private readonly circumference = 2 * Math.PI * 120;

  readonly proximoTexto = computed(() => {
    const s = this.store.session();
    if (!s) return 'Finalizar treino';
    const exercicio = s.exercises[s.currentExercise];
    const proximo = s.exercises[s.currentExercise + 1];
    if (exercicio && exercicio.sets.some((set) => !set.done)) {
      const serieAtual = exercicio.sets.filter((set) => set.done).length + 1;
      return `${exercicio.name} · série ${serieAtual}`;
    }
    return proximo?.name ?? 'Finalizar treino';
  });

  readonly dashOffset = computed(() => {
    const r = this.rest();
    const progresso = r.total ? r.remaining / r.total : 0;
    return this.circumference * (1 - progresso);
  });

  readonly circunferenciaSvg = this.circumference;

  readonly formatClock = formatClock;

  constructor() {
    addIcons({ checkmark, pause, play, playSkipForward, add });
  }
}
