import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, statsChartOutline, personOutline, barbellOutline, listOutline, trendingUpOutline } from 'ionicons/icons';
import { filter, map, startWith } from 'rxjs';
import { formatClock, WorkoutStore } from '../../features/workout/stores/workout.store';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, CommonModule, RouterLink],
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage {
  private readonly router = inject(Router);
  private readonly workout = inject(WorkoutStore);

  readonly session = this.workout.session;
  readonly elapsedSec = this.workout.elapsedSec;
  readonly formatClock = formatClock;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** Esconde a barra de "treino ativo" quando já se está na aba Treino. */
  readonly mostrarBarraTreino = computed(() => Boolean(this.session()) && !this.url().startsWith('/tabs/workout'));

  constructor() {
    addIcons({ homeOutline, barbellOutline, listOutline, trendingUpOutline, personOutline, statsChartOutline });
  }
}
