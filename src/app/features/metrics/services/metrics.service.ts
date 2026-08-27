import { Injectable, computed, inject, signal } from '@angular/core';
import {
  GetEvolucaoVolumeGQL,
  GetMelhoresMarcasGQL,
  GetMetricasResumoGQL,
  GetRecordesIsometricosGQL,
} from '../../../graphql/generated/graphql';
import { IsometricRecord, RecordePessoal, VolumePorSemana } from '../models/metrics.model';

export type MetricsLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Métricas do usuário autenticado — 100% vindas do GraphQL real (`metricasResumo`,
 * `evolucaoVolume`, `melhoresMarcas`), sem parâmetro de usuário: o back-end
 * identifica quem está pedindo pelo JWT (ver auth.interceptor.ts), então não
 * há como um usuário puxar a métrica de outro por aqui.
 */
@Injectable({ providedIn: 'root' })
export class MetricsService {
  private readonly metricasResumoGql = inject(GetMetricasResumoGQL);
  private readonly evolucaoVolumeGql = inject(GetEvolucaoVolumeGQL);
  private readonly melhoresMarcasGql = inject(GetMelhoresMarcasGQL);
  private readonly recordesIsometricosGql = inject(GetRecordesIsometricosGQL);

  readonly status = signal<MetricsLoadStatus>('idle');

  private readonly volumeSemanalTon = signal(0);
  private readonly variacaoVolumePercentual = signal(0);
  private readonly frequenciaSemanal = signal(0);
  private readonly seriesConcluidas = signal(0);
  private readonly ultimoTreinoTexto = signal('');

  private readonly volumePorSemana = signal<VolumePorSemana[]>([]);
  private readonly recordes = signal<RecordePessoal[]>([]);
  private readonly recordesIsometricos = signal<IsometricRecord[]>([]);

  readonly evolucaoVolume = this.volumePorSemana.asReadonly();
  readonly melhoresMarcas = this.recordes.asReadonly();
  readonly melhoresTemposIsometria = this.recordesIsometricos.asReadonly();
  readonly volumeMaximo = computed(() => Math.max(1, ...this.volumePorSemana().map((v) => v.value)));

  readonly resumoSemanal = computed(() => ({
    volumeTon: this.volumeSemanalTon(),
    volumeDeltaPercent: this.variacaoVolumePercentual(),
    frequenciaSemanal: this.frequenciaSemanal(),
    series: this.seriesConcluidas(),
    ultimoTreinoTexto: this.ultimoTreinoTexto(),
  }));

  /** Busca (ou rebusca) as três queries de métricas em paralelo. */
  carregar(): void {
    this.status.set('loading');

    this.metricasResumoGql.fetch({ fetchPolicy: 'network-only' }).subscribe({
      next: ({ data }) => {
        if (!data) return;
        const m = data.metricasResumo;
        this.volumeSemanalTon.set(m.volumeSemanalTon);
        this.variacaoVolumePercentual.set(m.variacaoVolumePercentual);
        this.frequenciaSemanal.set(m.frequenciaSemanal);
        this.seriesConcluidas.set(m.seriesConcluidas);
        this.ultimoTreinoTexto.set(m.ultimoTreinoTexto);
        this.status.set('loaded');
      },
      error: () => this.status.set('error'),
    });

    this.evolucaoVolumeGql.fetch({ fetchPolicy: 'network-only' }).subscribe({
      next: ({ data }) => {
        if (!data) return;
        this.volumePorSemana.set(data.evolucaoVolume.map((v) => ({ label: v.semana, value: v.volumeTon })));
      },
      error: () => this.status.set('error'),
    });

    this.melhoresMarcasGql.fetch({ fetchPolicy: 'network-only' }).subscribe({
      next: ({ data }) => {
        if (!data) return;
        this.recordes.set(
          data.melhoresMarcas.map((m) => ({
            exercise: m.exercicioNome,
            value: `${m.cargaKg} kg`,
            detail: `${m.repeticoes} reps · há ${m.diasAtras} dia${m.diasAtras === 1 ? '' : 's'}`,
          })),
        );
      },
      error: () => this.status.set('error'),
    });

    this.recordesIsometricosGql.fetch({ fetchPolicy: 'network-only' }).subscribe({
      next: ({ data }) => {
        if (!data) return;
        this.recordesIsometricos.set(
          data.recordesIsometricos.map((r) => ({
            exercicioId: r.exercicioId,
            exercicioNome: r.exercicioNome,
            melhorTempoSeg: r.maiorTempoSegundos,
            atingidoEm: r.atingidoEm,
          })),
        );
      },
      error: () => this.status.set('error'),
    });
  }
}
