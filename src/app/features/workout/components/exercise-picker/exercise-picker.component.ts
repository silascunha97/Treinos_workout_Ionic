import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { IonIcon, IonModal, IonSearchbar } from '@ionic/angular/standalone';
import type { SearchbarCustomEvent } from '@ionic/core';
import { addIcons } from 'ionicons';
import { checkmark, close, search, timerOutline } from 'ionicons/icons';
import { ExerciseCatalogService } from '../../../exercises/services/exercise-catalog.service';
import { TipoExercicio } from '../../../exercises/models/exercise.model';
import { AppButtonComponent } from '../../../../shared/components/app-button/app-button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { REPS_PADRAO, SETS_PADRAO, WorkoutStore } from '../../stores/workout.store';

export type ExercisePickerMode = 'create' | 'add';

/** Emitido em `confirmar()`. */
export interface ExercisePickerResult {
  ids: string[];
  /** Segundos de parada isométrica por id de exercício — só presente pra quem tem isometria envolvida. */
  holds: Record<string, number>;
}

const HOLD_SEGUNDOS_PADRAO_HIBRIDO = 10;
const HOLD_SEGUNDOS_PADRAO_ISOMETRICO = 30;

/**
 * Bottom sheet de seleção de exercícios (montar treino / adicionar exercício
 * em andamento) — replica o `ExercisePicker`/`BottomSheet` do protótipo
 * original (prototipagem/src/components/ExercisePicker.tsx e mobile-ui.tsx):
 * cabeçalho com título + botão fechar circular, busca, chips de grupo,
 * cards com checkbox e legenda "grupo · séries × reps".
 *
 * Só `ion-modal` (mecânica do sheet/breakpoints) e `ion-searchbar` (debounce
 * nativo — ver `onBuscaInput`) continuam Ionic. O resto (header/main/footer,
 * botão fechar, chips, cards com checkbox) é HTML semântico + Tailwind puro:
 * são elementos sem Shadow DOM, então a classe Tailwind aplica direto, sem
 * intermediário — trocar por componentes Ionic aqui não resolveria nada
 * quebrado e ainda exigiria reconstruir o visual via CSS custom properties.
 * Onde isso REALMENTE importa é `ion-searchbar` — ver comentário no template.
 */
@Component({
  selector: 'app-exercise-picker',
  standalone: true,
  imports: [IonModal, IonIcon, IonSearchbar, AppButtonComponent, EmptyStateComponent],
  templateUrl: './exercise-picker.component.html',
})
export class ExercisePickerComponent {
  private readonly catalog = inject(ExerciseCatalogService);
  private readonly store = inject(WorkoutStore);

  @Input() open = false;
  @Input() mode: ExercisePickerMode = 'create';
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<ExercisePickerResult>();

  readonly setsPadrao = SETS_PADRAO;
  readonly repsPadrao = REPS_PADRAO;

  readonly selecionados = signal<string[]>([]);
  readonly query = signal('');
  readonly grupo = signal<string | null>(null);

  /**
   * Chaveado por id de exercício. Só é relevante pra `HIBRIDO` (a pausa
   * isométrica é opcional nesse tipo — o usuário liga/desliga aqui). Pra
   * `ISOMETRICO` a isometria é sempre a série inteira (não tem toggle, ver
   * template); pra `DINAMICO` o card nem aparece.
   */
  readonly holdAtivo = signal<Record<string, boolean>>({});
  // `| undefined` explícito: é um Record parcial (só as chaves que o usuário
  // de fato mexeu), mas TS não modela "chave pode faltar" num Record<string,
  // number> comum — sem isso o compilador acha que o índice nunca é
  // undefined e reclama que os `??` no template são desnecessários (NG8102).
  readonly holdSegundos = signal<Record<string, number | undefined>>({});

  readonly grupos = this.catalog.gruposDisponiveis;
  readonly lista = this.catalog.exercicios;
  readonly carregando = this.catalog.status;
  readonly sessaoAtual = this.store.session;

  jaNoTreino(id: string): boolean {
    return Boolean(this.sessaoAtual()?.exercises.some((e) => e.id === id));
  }

  tipoDoExercicio(id: string): TipoExercicio | null {
    return this.lista().find((e) => e.id === id)?.tipoExercicio ?? null;
  }

  toggle(id: string): void {
    const jaSelecionado = this.selecionados().includes(id);
    this.selecionados.update((atual) => (jaSelecionado ? atual.filter((x) => x !== id) : [...atual, id]));
    // Desmarcar o exercício limpa o toggle de isometria dele (só relevante
    // pra HIBRIDO) — evita mandar `holds` de um exercício que nem faz mais
    // parte da seleção se ele for marcado de novo depois.
    if (jaSelecionado) this.holdAtivo.update((m) => ({ ...m, [id]: false }));
  }

  toggleHold(id: string): void {
    this.holdAtivo.update((m) => ({ ...m, [id]: !m[id] }));
    if (!(id in this.holdSegundos())) {
      this.holdSegundos.update((m) => ({ ...m, [id]: HOLD_SEGUNDOS_PADRAO_HIBRIDO }));
    }
  }

  ajustarHoldSegundos(id: string, delta: number): void {
    this.holdSegundos.update((m) => {
      const padrao = this.tipoDoExercicio(id) === 'ISOMETRICO' ? HOLD_SEGUNDOS_PADRAO_ISOMETRICO : HOLD_SEGUNDOS_PADRAO_HIBRIDO;
      const atual = m[id] ?? padrao;
      return { ...m, [id]: Math.max(1, Math.min(300, atual + delta)) };
    });
  }

  buscar(): void {
    this.catalog.buscar({ busca: this.query(), grupoMuscular: this.grupo() });
  }

  onBuscaInput(evento: SearchbarCustomEvent): void {
    this.query.set(evento.detail.value ?? '');
    this.buscar();
  }

  selecionarGrupo(g: string | null): void {
    this.grupo.set(this.grupo() === g ? null : g);
    this.buscar();
  }

  limparFiltros(): void {
    this.query.set('');
    this.grupo.set(null);
    this.buscar();
  }

  confirmar(): void {
    const ids = this.selecionados();
    if (!ids.length) return;

    const holdAtivo = this.holdAtivo();
    const holdSegundos = this.holdSegundos();

    // ISOMETRICO sempre entra em `holds` (não tem toggle, é a natureza do
    // exercício). HIBRIDO só entra se o usuário ligou o toggle. DINAMICO
    // nunca entra — `WorkoutStore.buildSessionExercise` decide `holdOnly`
    // sozinho a partir de `Exercicio.tipoExercicio`, então nem precisamos
    // mandar esse dado aqui, só o tempo.
    const holds: Record<string, number> = {};
    for (const id of ids) {
      const tipo = this.tipoDoExercicio(id);
      if (tipo === 'ISOMETRICO') {
        holds[id] = holdSegundos[id] ?? HOLD_SEGUNDOS_PADRAO_ISOMETRICO;
      } else if (tipo === 'HIBRIDO' && holdAtivo[id]) {
        holds[id] = holdSegundos[id] ?? HOLD_SEGUNDOS_PADRAO_HIBRIDO;
      }
    }

    if (this.mode === 'add') {
      ids.forEach((id) => void this.store.addExercise(id, holds[id]));
    }
    this.confirmed.emit({ ids, holds });
    this.selecionados.set([]);
    this.holdAtivo.set({});
    this.holdSegundos.set({});
  }

  /**
   * Botão "×" do cabeçalho: só pede o fechamento (via [isOpen] descendo a
   * false a partir do pai) — quem efetivamente limpa o estado é
   * `onDismiss()`, chamado pelo próprio Ionic quando a animação de saída
   * termina (arrastar pra baixo ou tocar no backdrop chegam no mesmo lugar).
   */
  fechar(): void {
    this.closed.emit();
  }

  onDismiss(): void {
    this.selecionados.set([]);
    this.query.set('');
    this.grupo.set(null);
    this.holdAtivo.set({});
    this.holdSegundos.set({});
    this.closed.emit();
  }

  constructor() {
    addIcons({ search, checkmark, close, timerOutline });
  }
}
