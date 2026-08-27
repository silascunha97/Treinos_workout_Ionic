import { Component, OnInit, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { barbell, calendarOutline, trophy } from 'ionicons/icons';
import { AppButtonComponent } from '../../../shared/components/app-button/app-button.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { PillComponent } from '../../../shared/components/pill/pill.component';
import { ExerciseCatalogService } from '../../../features/exercises/services/exercise-catalog.service';
import { Exercise } from '../../../features/exercises/models/exercise.model';
import { WorkoutStore } from '../../../features/workout/stores/workout.store';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-exercise-detail',
  standalone: true,
  imports: [IonContent, IonIcon, AppButtonComponent, HeaderComponent, PillComponent],
  templateUrl: './exercise-detail.page.html',
  styleUrls: ['./exercise-detail.page.scss'],
})
export class ExerciseDetailPage implements OnInit {
  private readonly catalog = inject(ExerciseCatalogService);
  private readonly store = inject(WorkoutStore);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  // Component input binding (withComponentInputBinding, já habilitado em app.config.ts).
  readonly exerciseId = input<string>('');

  readonly exercicio = signal<Exercise | null | undefined>(undefined); // undefined = carregando

  constructor() {
    addIcons({ trophy, barbell, calendarOutline });
  }

  ngOnInit(): void {
    this.catalog.buscarPorId(this.exerciseId()).then((ex) => this.exercicio.set(ex));
  }

  adicionarAoTreino(): void {
    const ex = this.exercicio();
    if (!ex) return;
    void this.store.addExercise(ex.id);
    void this.toast.show(`${ex.name} adicionado ao treino`);
    this.router.navigateByUrl('/tabs/workout');
  }
}
