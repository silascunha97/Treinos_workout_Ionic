import { Component, inject, signal } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [IonContent, HeaderComponent],
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {
  private readonly toast = inject(ToastService);

  // TODO: persistir essas preferências via StorageService quando o back-end
  // de perfil/preferências existir; por ora ficam só na sessão da tela.
  readonly descansoPadrao = signal(90);
  readonly iniciarDescansoAuto = signal(true);
  readonly vibracao = signal(true);
  readonly manterTelaAtiva = signal(true);

  ajustarDescanso(delta: number): void {
    const novo = Math.max(15, Math.min(300, this.descansoPadrao() + delta));
    this.descansoPadrao.set(novo);
    void this.toast.show('Descanso padrão salvo', 'info');
  }
}
