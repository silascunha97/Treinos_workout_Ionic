export interface SetEntry {
  weight: number;
  reps: number;
  done: boolean;
  holdSec: number;
}

export interface SessionExercise {
  id: string;
  name: string;
  group: string;
  restSeconds: number;
  lastSession?: { weight: number; reps: number };
  holdOnly: boolean;
  hold: boolean;
  sets: SetEntry[];
}

export interface Session {
  /**
   * Id da sessão no backend (`iniciarSessaoTreino`). `null` enquanto a
   * mutation não foi confirmada ainda (offline no início do treino) — nesse
   * caso as séries concluídas ficam na fila local (ver `filaSeries`) até
   * conseguirmos abrir a sessão remotamente.
   */
  idSessao: string | null;
  name: string;
  startedAt: number;
  exercises: SessionExercise[];
  currentExercise: number;
  updatedAt: number;
}

/** Uma série concluída localmente ainda não confirmada no backend. */
export interface OperacaoPendente {
  idExercicio: string;
  numeroSerie: number;
  repsRealizadas: number | null;
  tempoIsometriaSeg: number | null;
  tempoPausaIsometricaSeg: number | null;
  cargaAdicional: number | null;
}

export interface WorkoutSummary {
  name: string;
  durationSec: number;
  volume: number;
  sets: number;
  reps: number;
  exercises: number;
  /** vem de MetricsService.resumoSemanal() após finalizar — null se ainda não buscado. */
  volumeDelta: number | null;
  holdSec: number;
  holdSets: number;
}

export type SyncState = 'synced' | 'pending' | 'syncing' | 'error';
export type MetricsState = 'processing' | 'ready';

export interface RestState {
  active: boolean;
  remaining: number;
  total: number;
  paused: boolean;
  done: boolean;
}
