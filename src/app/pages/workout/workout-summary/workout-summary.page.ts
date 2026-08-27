import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowUpOutline, checkmark } from 'ionicons/icons';
import { AppButtonComponent } from '../../../shared/components/app-button/app-button.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PillComponent } from '../../../shared/components/pill/pill.component';
import { VolumePipe } from '../../../shared/pipes/volume.pipe';
import { formatClock, WorkoutStore } from '../../../features/workout/stores/workout.store';

@Component({
  selector: 'app-workout-summary',
  standalone: true,
  imports: [IonContent, IonIcon, AppButtonComponent, EmptyStateComponent, PillComponent, VolumePipe],
  templateUrl: './workout-summary.page.html',
  styleUrls: ['./workout-summary.page.scss'],
})
export class WorkoutSummaryPage {
  private readonly store = inject(WorkoutStore);
  private readonly router = inject(Router);

  readonly summary = this.store.summary;
  readonly online = this.store.online;
  readonly formatClock = formatClock;

  constructor() {
    addIcons({ checkmark, arrowUpOutline });
  }

  irParaMetricas(): void {
    this.router.navigateByUrl('/tabs/metrics');
  }

  voltarInicio(): void {
    this.router.navigateByUrl('/tabs/home');
  }

  iniciarTreino(): void {
    this.router.navigateByUrl('/tabs/workout');
  }
}
