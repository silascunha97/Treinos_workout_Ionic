import { Injectable, computed, inject, signal } from '@angular/core';
import { GetExercicioByIdGQL, GetExerciciosGQL } from '../../../graphql/generated/graphql';
import { Exercise } from '../models/exercise.model';

export type CatalogStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Catálogo de exercícios — 100% vindo de `exercicios`/`exercicio` (GraphQL
 * real). É um recurso público/compartilhado (o schema não tem noção de
 * "exercícios do usuário X"), então não há isolamento por usuário a garantir
 * aqui — qualquer usuário autenticado vê o mesmo catálogo.
 *
 * Grupos musculares (`gruposMusculares` abaixo) e equipamentos NÃO são
 * enumerados pelo schema (`Exercicio.grupoMuscular` é `String` livre, sem
 * enum) — os filtros de grupo na lista de exercícios usam os valores que
 * efetivamente vierem nos resultados, não uma lista fixa inventada.
 */
@Injectable({ providedIn: 'root' })
export class ExerciseCatalogService {
  private readonly exerciciosGql = inject(GetExerciciosGQL);
  private readonly exercicioByIdGql = inject(GetExercicioByIdGQL);

  readonly status = signal<CatalogStatus>('idle');
  private readonly catalogo = signal<Exercise[]>([]);
  readonly exercicios = this.catalogo.asReadonly();

  /**
   * `Exercicio.grupoMuscular` é `String` livre no schema (sem enum) — não há
   * lista fixa de grupos pra oferecer nos filtros. Os chips de grupo usam os
   * valores realmente vistos no que já foi carregado.
   */
  readonly gruposDisponiveis = computed(() =>
    [...new Set(this.catalogo().map((e) => e.group).filter((g): g is string => Boolean(g)))].sort(),
  );

  constructor() {
    this.buscar(); // carga inicial: alimenta a lista, o cache de lookup e os grupos disponíveis
  }

  /** Busca/filtra direto no backend (a lista completa não fica em memória local). */
  buscar(opts: { busca?: string; grupoMuscular?: string | null } = {}): void {
    this.status.set('loading');
    this.exerciciosGql
      .fetch({
        variables: { busca: opts.busca || null, grupoMuscular: opts.grupoMuscular || null },
        fetchPolicy: 'cache-first',
      })
      .subscribe({
        next: ({ data }) => {
          if (!data) return;
          this.catalogo.set(
            data.exercicios.map((e) => ({
              id: e.id,
              name: e.nome,
              group: e.grupoMuscular,
              secondaryMuscles: e.musculosSecundarios,
              bestLoadKg: e.cargaMaximaKg,
              permiteCarga: e.permiteCarga,
              tipoExercicio: e.tipoExercicio,
            })),
          );
          this.status.set('loaded');
        },
        error: () => this.status.set('error'),
      });
  }

  buscarPorId(id: string): Promise<Exercise | null> {
    return this.exercicioByIdGql
      .fetch({ variables: { id }, fetchPolicy: 'cache-first' })
      .toPromise()
      .then((res) => {
        const e = res?.data?.exercicio;
        if (!e) return null;
        return {
          id: e.id,
          name: e.nome,
          group: e.grupoMuscular,
          secondaryMuscles: e.musculosSecundarios,
          bestLoadKg: e.cargaMaximaKg,
          permiteCarga: e.permiteCarga,
          tipoExercicio: e.tipoExercicio,
          historicoCargas: e.historicoCargas,
        };
      });
  }

  /** Usado pelo WorkoutStore para montar uma sessão sem re-buscar a lista inteira. */
  porIdEmCache(id: string): Exercise | undefined {
    return this.catalogo().find((e) => e.id === id);
  }
}
