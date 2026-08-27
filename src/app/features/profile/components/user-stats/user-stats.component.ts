import { Component, computed, input } from '@angular/core';
import { IonSkeletonText } from '@ionic/angular/standalone';
import { WeightPipe } from '../../../../shared/pipes/weight.pipe';
import { PerfilEstatisticas } from '../../models/profile.model';

interface StatItem {
  valor: string;
  label: string;
}

/** Grade de 3 cards com os totais do usuário (treinos, volume total, recordes). */
@Component({
  selector: 'app-user-stats',
  standalone: true,
  imports: [IonSkeletonText],
  templateUrl: './user-stats.component.html',
})
export class UserStatsComponent {
  readonly estatisticas = input<PerfilEstatisticas | null>(null);
  readonly loading = input<boolean>(false);

  private readonly weightPipe = new WeightPipe();

  readonly itens = computed<StatItem[]>(() => {
    const dados = this.estatisticas();

    return [
      { valor: dados ? `${dados.totalTreinos}` : '0', label: 'Treinos' },
      { valor: dados ? this.weightPipe.transform(dados.volumeTotalTon, 'kg') : '0 kg', label: 'Volume total' },
      { valor: dados ? `${dados.totalRecordes}` : '0', label: 'Recordes' },
    ];
  });
}
