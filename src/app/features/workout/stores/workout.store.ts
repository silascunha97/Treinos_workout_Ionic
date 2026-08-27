import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  FinalizarSessaoTreinoGQL,
  IniciarSessaoTreinoGQL,
  RegistrarSerieGQL,
} from '../../../graphql/generated/graphql';
import { ExerciseCatalogService } from '../../exercises/services/exercise-catalog.service';
import { Exercise } from '../../exercises/models/exercise.model';
import { HapticsService } from '../../../core/native/haptics.service';
import { NetworkService } from '../../../core/native/network.service';
import { StorageService } from '../../../core/native/storage.service';
import { ToastService, ToastTone } from '../../../shared/services/toast.service';
import { MetricsService } from '../../metrics/services/metrics.service';
import {
  MetricsState,
  OperacaoPendente,
  RestState,
  Session,
  SessionExercise,
  SetEntry,
  SyncState,
  WorkoutSummary,
} from '../models/workout.model';

const SESSION_KEY = 'forja.session.v1';
const FILA_KEY = 'forja.fila-series.v1';

const REST_IDLE: RestState = { active: false, remaining: 0, total: 0, paused: false, done: false };

// O schema GraphQL não modela "plano" por exercício (nº de séries/reps/descanso
// sugeridos, ou se é isométrico) — isso é puramente uma convenção de montagem de
// treino do app, não dado do servidor. `bestLoadKg` (real, vem do backend) é
// usado como sugestão inicial de carga quando disponível.
// Exportadas (não só locais) porque o exercise-picker mostra "SETS_PADRAO ×
// REPS_PADRAO" na legenda de cada exercício — precisa ser exatamente o valor
// que será aplicado de fato aqui embaixo, não um número reescrito à mão lá.
export const SETS_PADRAO = 4;
export const REPS_PADRAO = 10;
const DESCANSO_PADRAO_SEG = 90;
const CARGA_INICIAL_PADRAO_KG = 20;

// `holdOnly` vem direto de `Exercicio.tipoExercicio` (campo real do
// catálogo, espelha a coluna `tipo_exercicio` do banco) — não é mais uma
// escolha do usuário no exercise-picker. Quando o exercício é ISOMETRICO,
// força `hold` junto: não existe estado "isometria pura desligada", o que
// mantém `heldSec`/o toast em completeSet() e o `holdSec` inicial das
// séries corretos. Pra HIBRIDO, `hold` só liga se o usuário de fato marcou
// um `holdSec` no picker (a pausa isométrica é opcional pra esse tipo).
// Carga também fica opcional/zerada quando é isométrico puro — não faz
// sentido sugerir 20kg por padrão pra quem só vai medir tempo sustentado.
function buildSessionExercise(ex: Exercise, holdSec?: number): SessionExercise {
  const holdOnly = ex.tipoExercicio === 'ISOMETRICO';
  const hold = holdOnly || (holdSec ?? 0) > 0;
  const pesoInicial = holdOnly ? 0 : (ex.bestLoadKg ?? CARGA_INICIAL_PADRAO_KG);
  return {
    id: ex.id,
    name: ex.name,
    group: ex.group ?? 'Geral',
    restSeconds: DESCANSO_PADRAO_SEG,
    holdOnly,
    hold,
    sets: Array.from({ length: SETS_PADRAO }, () => ({
      weight: pesoInicial,
      reps: holdOnly ? 0 : REPS_PADRAO,
      done: false,
      holdSec: hold ? (holdSec ?? 10) : 0,
    })),
  };
}

function currentSetIndex(ex: SessionExercise): number {
  const idx = ex.sets.findIndex((s) => !s.done);
  return idx === -1 ? ex.sets.length - 1 : idx;
}

/**
 * Estado do treino ativo — Signals + persistência local (offline-first via
 * @capacitor/preferences, ver StorageService) + integração real com o
 * GraphQL do backend:
 *
 *   startWorkout    -> mutation `iniciarSessaoTreino(treinoId: null)`
 *   completeSet      -> mutation `registrarSerie` por série concluída
 *   finishWorkout    -> mutation `finalizarSessaoTreino`
 *
 * Nenhuma dessas operações recebe um id de usuário — o backend identifica
 * quem está chamando pelo JWT (ver core/interceptors/auth.interceptor.ts),
 * então não há como este store, mesmo adulterado, pedir dados de outro
 * usuário: o servidor nunca aceitaria um parâmetro assim porque essas
 * operações simplesmente não têm esse parâmetro no schema.
 *
 * Sync Queue: se `registrarSerie`/`iniciarSessaoTreino` falharem (rede),
 * as séries concluídas ficam em `filaSeries` (persistida) e são reenviadas
 * quando `NetworkService.isOnline` voltar a `true`. Não há back-off nem
 * resolução de conflito — é o suficiente para o cenário "perdeu sinal na
 * academia por alguns minutos", não para uma fila robusta multi-dia.
 */
@Injectable({ providedIn: 'root' })
export class WorkoutStore {
  private readonly storage = inject(StorageService);
  private readonly network = inject(NetworkService);
  private readonly haptics = inject(HapticsService);
  private readonly toast = inject(ToastService);
  private readonly catalog = inject(ExerciseCatalogService);
  private readonly metrics = inject(MetricsService);

  private readonly iniciarSessaoGql = inject(IniciarSessaoTreinoGQL);
  private readonly registrarSerieGql = inject(RegistrarSerieGQL);
  private readonly finalizarSessaoGql = inject(FinalizarSessaoTreinoGQL);

  private hydrated = false;

  readonly session = signal<Session | null>(null);
  readonly recovered = signal(false);
  readonly syncState = signal<SyncState>('synced');
  readonly filaSeries = signal<OperacaoPendente[]>([]);
  readonly pendingOps = computed(() => this.filaSeries().length);
  readonly metricsState = signal<MetricsState>('ready');
  readonly summary = signal<WorkoutSummary | null>(null);
  readonly savingSet = signal(false);
  readonly elapsedSec = signal(0);
  readonly rest = signal<RestState>(REST_IDLE);

  /** Conectividade real do dispositivo (NetworkService/@capacitor/network). */
  readonly online = this.network.isOnline;

  readonly exercicioAtual = computed<SessionExercise | null>(() => {
    const s = this.session();
    return s ? (s.exercises[s.currentExercise] ?? null) : null;
  });

  constructor() {
    this.hidratar();
    setInterval(() => this.tickElapsed(), 1000);
    setInterval(() => this.tickRest(), 1000);

    // Reenvia a fila assim que a conexão volta.
    let estavaOnline = this.online();
    effect(() => {
      const agoraOnline = this.online();
      if (agoraOnline && !estavaOnline) void this.sincronizarFila();
      estavaOnline = agoraOnline;
    });
  }

  private async hidratar(): Promise<void> {
    const salva = await this.storage.get<Session>(SESSION_KEY);
    if (salva?.exercises?.length) {
      this.session.set(salva);
      this.recovered.set(true);
    }
    const fila = await this.storage.get<OperacaoPendente[]>(FILA_KEY);
    if (fila?.length) {
      this.filaSeries.set(fila);
      this.syncState.set('pending');
    }
    this.hydrated = true;
  }

  private tickElapsed(): void {
    const s = this.session();
    if (!s) {
      if (this.elapsedSec() !== 0) this.elapsedSec.set(0);
      return;
    }
    this.elapsedSec.set(Math.max(0, Math.floor((Date.now() - s.startedAt) / 1000)));
  }

  private tickRest(): void {
    const r = this.rest();
    if (!r.active || r.paused || r.done) return;
    if (r.remaining <= 1) {
      this.rest.set({ ...r, remaining: 0, done: true });
      void this.haptics.notificationSuccess();
      return;
    }
    this.rest.set({ ...r, remaining: r.remaining - 1 });
  }

  private applySession(next: Session | null): void {
    this.session.set(next);
    if (!this.hydrated) return;
    if (next) void this.storage.set(SESSION_KEY, next);
    else void this.storage.remove(SESSION_KEY);
  }

  private applyFila(next: OperacaoPendente[]): void {
    this.filaSeries.set(next);
    if (!this.hydrated) return;
    if (next.length) void this.storage.set(FILA_KEY, next);
    else void this.storage.remove(FILA_KEY);
  }

  private showToast(text: string, tone: ToastTone = 'success'): void {
    void this.toast.show(text, tone);
  }

  dismissRecovery(): void {
    this.recovered.set(false);
  }

  /**
   * Monta a sessão localmente (offline-first — nunca espera a rede pra
   * deixar o usuário começar a treinar) e, em paralelo, tenta abrir a
   * sessão no backend via `iniciarSessaoTreino(treinoId: null)`. `treinoId`
   * fica `null` de propósito: o schema não expõe nenhuma query que devolva
   * a lista de exercícios de um "treino" pré-definido (`treinoHoje` só
   * retorna título/contagem/resumo em texto), então a única forma real de
   * montar uma sessão hoje é ad-hoc, exercício a exercício — exatamente o
   * fluxo do seletor de exercícios.
   */
  async startWorkout(
    exerciseIds: string[],
    name = 'Treino de hoje',
    holds: Record<string, number> = {},
  ): Promise<void> {
    const encontrados = await Promise.all(exerciseIds.map((id) => this.resolverExercicio(id)));
    const escolhidos = encontrados.filter((e): e is Exercise => Boolean(e));
    if (!escolhidos.length) return;

    this.applySession({
      idSessao: null,
      name,
      startedAt: Date.now(),
      exercises: escolhidos.map((ex) => buildSessionExercise(ex, holds[ex.id])),
      currentExercise: 0,
      updatedAt: Date.now(),
    });
    this.recovered.set(false);
    this.summary.set(null);
    this.rest.set(REST_IDLE);

    this.abrirSessaoRemota();
  }

  /** Prefere o cache local do catálogo (evita ida à rede se a lista já foi carregada). */
  private resolverExercicio(id: string): Promise<Exercise | null> {
    const emCache = this.catalog.porIdEmCache(id);
    if (emCache) return Promise.resolve(emCache);
    return this.catalog.buscarPorId(id);
  }

  private abrirSessaoRemota(): void {
    this.iniciarSessaoGql.mutate({ variables: { treinoId: null }, fetchPolicy: 'no-cache' }).subscribe({
      next: ({ data }) => {
        const idSessao = data?.iniciarSessaoTreino?.id;
        if (!idSessao) return;
        const atual = this.session();
        if (atual && !atual.idSessao) this.applySession({ ...atual, idSessao });
        void this.sincronizarFila();
      },
      error: () => {
        // Offline-first: a sessão local continua normalmente. `idSessao` fica
        // `null` e a fila local acumula as séries até conseguirmos abrir a
        // sessão remota (retry em completeSet()/sincronizarFila()).
        this.syncState.set('pending');
      },
    });
  }

  async addExercise(id: string, holdSec?: number): Promise<void> {
    const ex = await this.resolverExercicio(id);
    if (!ex) return;

    const atual = this.session();
    if (!atual) {
      this.applySession({
        idSessao: null,
        name: 'Treino de hoje',
        startedAt: Date.now(),
        exercises: [buildSessionExercise(ex, holdSec)],
        currentExercise: 0,
        updatedAt: Date.now(),
      });
      this.abrirSessaoRemota();
      return;
    }
    if (atual.exercises.some((e) => e.id === id)) return;
    this.applySession({
      ...atual,
      exercises: [...atual.exercises, buildSessionExercise(ex, holdSec)],
      updatedAt: Date.now(),
    });
  }

  removeExercise(index: number): void {
    const atual = this.session();
    if (!atual) return;
    const exercises = atual.exercises.filter((_, i) => i !== index);
    if (!exercises.length) return;
    this.applySession({
      ...atual,
      exercises,
      currentExercise: Math.min(atual.currentExercise, exercises.length - 1),
      updatedAt: Date.now(),
    });
  }

  /** Liga/desliga a isometria do exercício informado (parada de X segundos por série). */
  setExerciseHold(index: number, holdSec: number | null): void {
    const atual = this.session();
    if (!atual) return;
    const exercises = atual.exercises.map((ex, i) => {
      if (i !== index) return ex;
      if (holdSec === null) {
        if (ex.holdOnly) return ex;
        return { ...ex, hold: false, sets: ex.sets.map((s) => (s.done ? s : { ...s, holdSec: 0 })) };
      }
      const seconds = Math.max(1, Math.min(300, Math.round(holdSec)));
      return { ...ex, hold: true, sets: ex.sets.map((s) => (s.done ? s : { ...s, holdSec: seconds })) };
    });
    this.applySession({ ...atual, exercises, updatedAt: Date.now() });
  }

  updateSet(patch: Partial<SetEntry>): void {
    const atual = this.session();
    if (!atual) return;
    const exercises = atual.exercises.map((ex, i) => {
      if (i !== atual.currentExercise) return ex;
      const si = currentSetIndex(ex);
      const sets = ex.sets.map((set, j) =>
        j === si
          ? {
              ...set,
              ...patch,
              weight: Math.max(0, Math.min(500, patch.weight ?? set.weight)),
              reps: Math.max(1, Math.min(100, patch.reps ?? set.reps)),
              holdSec: Math.max(0, Math.min(300, patch.holdSec ?? set.holdSec)),
            }
          : set,
      );
      return { ...ex, sets };
    });
    this.applySession({ ...atual, exercises, updatedAt: Date.now() });
  }

  completeSet(): void {
    if (this.savingSet()) return; // proteção contra múltiplos toques
    this.savingSet.set(true);
    setTimeout(() => this.savingSet.set(false), 550);

    const atual = this.session();
    if (!atual) return;

    let restFor = 90;
    let heldSec = 0;
    let operacao: OperacaoPendente | null = null;
    const exercises = atual.exercises.map((ex, i) => {
      if (i !== atual.currentExercise) return ex;
      const si = currentSetIndex(ex);
      restFor = ex.restSeconds;
      const setAtual = ex.sets[si];
      heldSec = ex.hold ? (setAtual?.holdSec ?? 0) : 0;

      operacao = {
        idExercicio: ex.id,
        numeroSerie: si + 1,
        // holdOnly: só tempo de sustentação, sem reps. hold (sem holdOnly): série
        // dinâmica com uma pausa isométrica extra — mapeado pro campo separado
        // `tempoPausaIsometricaSeg` (distinto de `tempoIsometriaSeg`, que é do
        // exercício puramente isométrico), já que o schema modela os dois casos
        // como conceitos diferentes.
        repsRealizadas: ex.holdOnly ? null : (setAtual?.reps ?? null),
        tempoIsometriaSeg: ex.holdOnly ? (setAtual?.holdSec ?? null) : null,
        tempoPausaIsometricaSeg: !ex.holdOnly && ex.hold ? (setAtual?.holdSec ?? null) : null,
        // Não há campo de "peso corporal" separado no schema — `cargaAdicional`
        // é o melhor mapeamento disponível para o peso registrado na série.
        cargaAdicional: setAtual?.weight ?? null,
      };

      return { ...ex, sets: ex.sets.map((s, j) => (j === si ? { ...s, done: true } : s)) };
    });
    this.applySession({ ...atual, exercises, updatedAt: Date.now() });

    if (operacao) this.registrarOuEnfileirar(atual.idSessao, operacao);

    this.rest.set({ active: true, remaining: restFor, total: restFor, paused: false, done: false });
    void this.haptics.impactMedium();
    this.showToast(heldSec > 0 ? `Série + ${heldSec}s de isometria` : 'Série concluída', 'success');
  }

  private registrarOuEnfileirar(idSessao: string | null, operacao: OperacaoPendente): void {
    if (!idSessao || !this.online()) {
      this.applyFila([...this.filaSeries(), operacao]);
      this.syncState.set('pending');
      return;
    }
    this.syncState.set('syncing');
    this.registrarSerieGql
      .mutate({ variables: { input: { idSessao, ...operacao, concluido: true } }, fetchPolicy: 'no-cache' })
      .subscribe({
        next: () => this.syncState.set(this.filaSeries().length ? 'pending' : 'synced'),
        error: () => {
          this.applyFila([...this.filaSeries(), operacao]);
          this.syncState.set('pending');
        },
      });
  }

  /** Reenvia a fila local (séries pendentes) — chamado ao reconectar. */
  private async sincronizarFila(): Promise<void> {
    const idSessao = this.session()?.idSessao;
    const fila = this.filaSeries();
    if (!idSessao || !fila.length || !this.online()) return;

    this.syncState.set('syncing');
    let restantes = [...fila];
    for (const operacao of fila) {
      try {
        await this.registrarSerieGql
          .mutate({ variables: { input: { idSessao, ...operacao, concluido: true } }, fetchPolicy: 'no-cache' })
          .toPromise();
        restantes = restantes.filter((o) => o !== operacao);
        this.applyFila(restantes);
      } catch {
        break; // mantém o restante na fila e tenta de novo na próxima reconexão
      }
    }
    this.syncState.set(restantes.length ? 'pending' : 'synced');
    if (!restantes.length) this.showToast('Treino sincronizado', 'success');
  }

  undoLastSet(): void {
    const atual = this.session();
    if (!atual) return;
    const exercises = atual.exercises.map((ex, i) => {
      if (i !== atual.currentExercise) return ex;
      const lastDone = [...ex.sets].reverse().findIndex((s) => s.done);
      if (lastDone === -1) return ex;
      const idx = ex.sets.length - 1 - lastDone;
      return { ...ex, sets: ex.sets.map((s, j) => (j === idx ? { ...s, done: false } : s)) };
    });
    this.applySession({ ...atual, exercises, updatedAt: Date.now() });
    this.rest.set(REST_IDLE);
    this.showToast('Série desfeita', 'info');
    // Nota: não há mutation de "desfazer série" no schema — se a série já
    // tiver sido confirmada no backend, o desfazer aqui é só local/visual.
  }

  goToExercise(index: number): void {
    const atual = this.session();
    if (atual) this.applySession({ ...atual, currentExercise: index, updatedAt: Date.now() });
    this.rest.set(REST_IDLE);
  }

  discardSession(): void {
    this.applySession(null);
    this.recovered.set(false);
    this.rest.set(REST_IDLE);
    this.showToast('Sessão descartada', 'info');
  }

  finishWorkout(): void {
    const s = this.session();
    const done = s ? s.exercises.flatMap((ex) => ex.sets.filter((set) => set.done)) : [];
    const holdSec = s
      ? s.exercises.reduce(
          (acc, ex) => acc + (ex.hold ? ex.sets.filter((set) => set.done).reduce((a, set) => a + set.holdSec, 0) : 0),
          0,
        )
      : 0;
    const holdSets = s
      ? s.exercises.reduce(
          (acc, ex) => acc + (ex.hold ? ex.sets.filter((set) => set.done && set.holdSec > 0).length : 0),
          0,
        )
      : 0;
    const volumeLocal = Math.round(done.reduce((acc, set) => acc + set.weight * set.reps, 0));
    const elapsed = this.elapsedSec();

    // Resultado provisório com o que foi acompanhado localmente — atualizado
    // com os valores oficiais assim que `finalizarSessaoTreino` responder.
    this.summary.set({
      name: s?.name ?? 'Treino',
      durationSec: elapsed,
      volume: volumeLocal,
      sets: done.length,
      reps: done.reduce((a, set) => a + set.reps, 0),
      exercises: s ? s.exercises.filter((ex) => ex.sets.some((set) => set.done)).length : 0,
      volumeDelta: null,
      holdSec,
      holdSets,
    });

    const idSessao = s?.idSessao;
    this.applySession(null);
    this.rest.set(REST_IDLE);
    this.metricsState.set('processing');

    if (idSessao) {
      this.finalizarSessaoGql.mutate({ variables: { sessaoId: idSessao, dados: {} }, fetchPolicy: 'no-cache' }).subscribe({
        next: ({ data }) => {
          const resultado = data?.finalizarSessaoTreino;
          if (resultado) {
            this.summary.update((atual) =>
              atual
                ? {
                    ...atual,
                    durationSec: (resultado.duracaoMinutos ?? Math.round(elapsed / 60)) * 60,
                    volume: resultado.volumeTotalKg ?? atual.volume,
                  }
                : atual,
            );
          }
          this.syncState.set(this.filaSeries().length ? 'pending' : 'synced');
        },
        error: () => this.syncState.set('pending'),
      });
    } else {
      // Sessão nunca foi aberta no backend (offline desde o início) — nada a
      // finalizar remotamente ainda; fica marcado como pendente.
      this.syncState.set('pending');
    }

    // Consistência eventual: RabbitMQ processa métricas no backend de forma
    // assíncrona; não há campo no schema que confirme "já terminou". Damos
    // uma janela e então buscamos o que a query trouxer — ver metrics.page.
    setTimeout(() => {
      this.metricsState.set('ready');
      this.metrics.carregar();
      const delta = this.metrics.resumoSemanal().volumeDeltaPercent;
      this.summary.update((atual) => (atual ? { ...atual, volumeDelta: delta } : atual));
    }, 3000);
  }

  readonly restControls = {
    pause: (): void => this.rest.update((r) => ({ ...r, paused: !r.paused })),
    add: (sec: number): void =>
      this.rest.update((r) => ({ ...r, remaining: r.remaining + sec, total: r.total + sec, done: false })),
    skip: (): void => this.rest.set(REST_IDLE),
    close: (): void => this.rest.set(REST_IDLE),
  };
}

export function formatClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
