import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GetExerciciosGQL } from '../../../graphql/generated/graphql';
import { ExercicioPickerItem } from '../models/exercise-picker.model';

/**
 * TODO: substituir por um campo real do back-end (ex.: `protocoloPadrao`)
 * assim que o schema GraphQL expuser séries/repetições sugeridas por
 * exercício. Ver `ExercicioPickerItem.sugestaoSeriesReps`.
 */
const SUGESTAO_POR_GRUPO: Record<string, string> = {
  peito: '4 x 10',
  costas: '4 x 12',
  pernas: '4 x 8',
  ombro: '3 x 10',
  ombros: '3 x 10',
  braço: '3 x 12',
  braços: '3 x 12',
  abdomen: '3 x 15',
  abdômen: '3 x 15',
};
const SUGESTAO_PADRAO = '3 x 12';

@Injectable({
  providedIn: 'root',
})
export class ExercisePickerService {
  private readonly exerciciosGql = inject(GetExerciciosGQL);

  /** Busca exercícios do catálogo, opcionalmente filtrando por texto e grupo muscular. */
  buscar(busca: string | null, grupoMuscular: string | null): Observable<ExercicioPickerItem[]> {
    return this.exerciciosGql
      .fetch({ variables: { busca: busca || null, grupoMuscular: grupoMuscular || null } })
      .pipe(
        map(({ data }) =>
          (data?.exercicios ?? []).map((exercicio) => ({
            id: exercicio.id,
            nome: exercicio.nome,
            grupoMuscular: exercicio.grupoMuscular,
            sugestaoSeriesReps:
              SUGESTAO_POR_GRUPO[exercicio.grupoMuscular?.toLowerCase().trim() ?? ''] ?? SUGESTAO_PADRAO,
          }))
        )
      );
  }
}
