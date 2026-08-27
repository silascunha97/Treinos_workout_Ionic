import { Component, computed, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { wifi, wifiOutline } from 'ionicons/icons';
import { WorkoutStore } from '../../stores/workout.store';

/** Badge "Salvo/Salvando/Pendente/Offline" — reflete WorkoutStore.online + syncState. */
@Component({
  selector: 'app-sync-pill',
  standalone: true,
  imports: [IonIcon],
  template: `
    <span [class]="classes()">
      <ion-icon [name]="online() ? 'wifi' : 'wifi-outline'" class="text-xs"></ion-icon>
      {{ label() }}
    </span>
  `,
  styles: [':host { display: contents; }'],
})
export class SyncPillComponent {
  private readonly store = inject(WorkoutStore);

  readonly online = this.store.online;
  private readonly syncState = this.store.syncState;

  private readonly estado = computed(() => {
    if (!this.online()) return { text: 'Offline', cls: 'bg-warning/15 text-warning' };
    const map = {
      synced: { text: 'Salvo', cls: 'bg-success/15 text-success' },
      syncing: { text: 'Salvando', cls: 'bg-info/15 text-info' },
      pending: { text: 'Pendente', cls: 'bg-warning/15 text-warning' },
      error: { text: 'Erro ao salvar', cls: 'bg-destructive/15 text-destructive' },
    } as const;
    return map[this.syncState()];
  });

  readonly label = computed(() => this.estado().text);
  readonly classes = computed(
    () => `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${this.estado().cls}`,
  );

  constructor() {
    addIcons({ wifi, wifiOutline });
  }
}
