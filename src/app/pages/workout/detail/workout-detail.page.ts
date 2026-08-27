import { Component } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons } from '@ionic/angular/standalone';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, IonTitle, IonBackButton, IonButtons],
  templateUrl: './workout-detail.page.html',
  styleUrls: ['./workout-detail.page.scss'],
})
export class WorkoutDetailPage {
  // TODO: regra de negócio (carregar detalhe do treino pelo :id, exercícios, iniciar execução, etc.)
}
