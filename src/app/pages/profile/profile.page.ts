import { Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForward, logOutOutline, settingsOutline } from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import { UserStatsComponent } from '../../features/profile/components/user-stats/user-stats.component';
import { ProfileStore } from '../../features/profile/stores/profile.store';
import { StatBadgeComponent } from '../../shared/components/stat-badge/stat-badge.component';
import { DurationPipe } from '../../shared/pipes/duration.pipe';
import { WeightPipe } from '../../shared/pipes/weight.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonSkeletonText,
    UserStatsComponent,
    StatBadgeComponent,
    WeightPipe,
    DurationPipe,
  ],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  private readonly profileStore = inject(ProfileStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alertCtrl = inject(AlertController);

  readonly usuario = this.profileStore.usuario;
  readonly estatisticas = this.profileStore.estatisticas;
  readonly historico = this.profileStore.historico;
  readonly volumeMensal = this.profileStore.volumeMensal;
  readonly isLoading = this.profileStore.isLoading;

  readonly inicialNome = computed(() => this.usuario()?.nome?.trim()?.charAt(0)?.toUpperCase() ?? '');

  /** Nome do mês corrente (ex.: "Agosto"), usado como dica no card "Volume do mês". */
  readonly mesReferencia = computed(() => {
    const nome = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date());
    return nome.charAt(0).toUpperCase() + nome.slice(1);
  });

  readonly subtituloTreino = computed(() => {
    const usuario = this.usuario();
    if (!usuario) return '';
    return `Treinando há ${usuario.treinandoDesdeMeses} meses · ${usuario.treinosPorSemanaMedia} treinos/semana`;
  });

  constructor() {
    addIcons({ settingsOutline, chevronForward, logOutOutline });
  }

  ngOnInit(): void {
    this.profileStore.carregar();
  }

  abrirAjustes(): void {
    this.router.navigateByUrl('/settings');
  }

  verHistoricoCompleto(): void {
    this.router.navigateByUrl('/workout/history');
  }

  async sairDaConta(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Sair da conta',
      message: 'Tem certeza que deseja encerrar a sessão?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sair',
          role: 'destructive',
          handler: () => this.authService.logout(),
        },
      ],
    });

    await alert.present();
  }
}
