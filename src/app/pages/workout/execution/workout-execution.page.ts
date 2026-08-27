import { Component } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';

@Component({
  selector: 'app-workout-execution',
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, IonTitle],
  templateUrl: './workout-execution.page.html',
  styleUrls: ['./workout-execution.page.scss'],
})
export class WorkoutExecutionPage {
  // TODO: regra de negócio (execução do treino em andamento — séries, carga,
  // descanso, KeepAwakeService, persistência via workout.store.ts, etc.)
}
