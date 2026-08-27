import { Component, computed, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircle, checkmarkCircle, informationCircle } from 'ionicons/icons';
import { ToastService, ToastTone } from '../../services/toast.service';

const TONE_CLASS: Record<ToastTone, string> = {
  success: 'bg-success text-background',
  info: 'bg-info text-background',
  error: 'bg-destructive text-destructive-foreground',
};

const TONE_ICON: Record<ToastTone, string> = {
  success: 'checkmark-circle',
  info: 'information-circle',
  error: 'alert-circle',
};

/**
 * Overlay de notificação global (ex.: "Série concluída"), montado uma única
 * vez em `app.component.html`. Fica fora de `ion-content`/`ion-router-outlet`
 * de propósito — `position: fixed` relativo à viewport, para funcionar em
 * qualquer tela sem depender de cada página ter seu próprio container.
 *
 * Hierarquia de z-index do app (ver theme/variables.scss e este comentário
 * como referência única): conteúdo/base (auto) < seções sticky internas
 * (z-10) < ações flutuantes de tela, ex. rest-timer (z-50) < este toast
 * (z-[70]) < ion-modal (gerenciado pelo próprio Ionic, sempre acima).
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [IonIcon],
  template: `
    @if (toast.active(); as t) {
      <div
        class="rise fixed inset-x-4 z-[70] flex items-center gap-2 rounded-2xl px-4 py-3 shadow-lift"
        style="top: calc(0.75rem + var(--safe-top))"
        [class]="toneClass()"
        role="status"
        aria-live="polite"
      >
        <ion-icon [name]="toneIcon()" class="shrink-0 text-lg"></ion-icon>
        <span class="text-sm font-bold">{{ t.text }}</span>
      </div>
    }
  `,
  styles: [':host { display: contents; }'],
})
export class AppToastComponent {
  readonly toast = inject(ToastService);

  readonly toneClass = computed(() => TONE_CLASS[this.toast.active()?.tone ?? 'success']);
  readonly toneIcon = computed(() => TONE_ICON[this.toast.active()?.tone ?? 'success']);

  constructor() {
    addIcons({ checkmarkCircle, informationCircle, alertCircle });
  }
}
