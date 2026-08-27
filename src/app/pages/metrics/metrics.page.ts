import { Component, OnInit, inject } from '@angular/core';
import { IonContent, IonIcon, IonSkeletonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline, refresh, stopwatchOutline, trophy } from 'ionicons/icons';
import { AppButtonComponent } from '../../shared/components/app-button/app-button.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StatBadgeComponent } from '../../shared/components/stat-badge/stat-badge.component';
import { WeightPipe } from '../../shared/pipes/weight.pipe';
import { MetricsService } from '../../features/metrics/services/metrics.service';
import { WorkoutStore } from '../../features/workout/stores/workout.store';
import { SyncPillComponent } from '../../features/workout/components/sync-pill/sync-pill.component';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [IonContent, IonIcon, IonSkeletonText, AppButtonComponent, HeaderComponent, StatBadgeComponent, SyncPillComponent, WeightPipe],
  templateUrl: './metrics.page.html',
  styleUrls: ['./metrics.page.scss'],
})
export class MetricsPage implements OnInit {
  private readonly metrics = inject(MetricsService);
  private readonly store = inject(WorkoutStore);

  readonly status = this.metrics.status;
  readonly resumo = this.metrics.resumoSemanal;
  readonly evolucaoVolume = this.metrics.evolucaoVolume;
  readonly volumeMaximo = this.metrics.volumeMaximo;
  readonly melhoresMarcas = this.metrics.melhoresMarcas;
  readonly melhoresTemposIsometria = this.metrics.melhoresTemposIsometria;

  readonly online = this.store.online;
  // Consistência eventual: o back-end processa métricas via RabbitMQ após
  // finalizar um treino. Não há campo no schema que confirme "já terminou de
  // processar" — este estado é uma janela client-side (ver WorkoutStore),
  // não uma garantia real. Depois dela, mostramos o que a query trouxer.
  readonly metricsState = this.store.metricsState;

  constructor() {
    addIcons({ alertCircleOutline, refresh, trophy, stopwatchOutline });
  }

  ngOnInit(): void {
    this.metrics.carregar();
  }

  recarregar(): void {
    this.metrics.carregar();
  }
}
