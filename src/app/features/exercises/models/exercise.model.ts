/**
 * Espelha o tipo `Exercicio` real do schema GraphQL (ver
 * GetExerciciosQuery/GetExercicioByIdQuery em graphql/generated/graphql.ts).
 * Campos que o protótipo Lovable usava mas o backend não expõe
 * (description, cues, muscles, defaultSets/defaultReps por exercício) foram
 * removidos daqui de propósito — ver ExerciseCatalogService para onde os
 * defaults de montagem de treino (puramente client-side, não fingem ser
 * dado do servidor) entram.
 */
export interface HistoricoCarga {
  data: string;
  pesoKg: number | null;
  repeticoes: number | null;
}

/**
 * Espelha o enum `TipoExercicio` do schema (campo `tipo_exercicio` no banco).
 * DINAMICO = só repetições; ISOMETRICO = só tempo de sustentação, sem reps;
 * HIBRIDO = repetições com uma pausa isométrica opcional dentro da série.
 */
export type TipoExercicio = 'DINAMICO' | 'ISOMETRICO' | 'HIBRIDO';

export interface Exercise {
  id: string;
  name: string;
  group: string | null;
  secondaryMuscles: string[];
  bestLoadKg: number | null;
  permiteCarga: boolean;
  tipoExercicio: TipoExercicio;
  /** Só vem preenchido na query de detalhe (`exercicio(id)`), não na lista. */
  historicoCargas?: HistoricoCarga[];
}
