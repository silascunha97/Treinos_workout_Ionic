/** Dados de identidade e streak exibidos no cabeçalho do Perfil. */
export interface PerfilUsuario {
  id: string;
  nome: string;
  email: string;
  fotoUrl: string | null;
  metaSemanalTreinos: number;
  /** Há quantos meses o usuário treina no app. */
  treinandoDesdeMeses: number;
  /** Média de treinos por semana. */
  treinosPorSemanaMedia: number;
}

/**
 * Totais agregados exibidos nos cards de estatística do Perfil.
 * `totalTreinos` e `volumeTotalTon` são dos últimos 7 dias (agregado pelo
 * back-end via `metricasResumo`), não um total histórico da conta — ver
 * ProfileService.getPerfilCompleto. `totalRecordes` é `melhoresMarcas.length`.
 */
export interface PerfilEstatisticas {
  totalTreinos: number;
  volumeTotalTon: number;
  totalRecordes: number;
}

/**
 * Item da lista "Histórico recente" do Perfil.
 * `volumeTotalKg` está em quilos (não toneladas) — o `WeightPipe` sempre
 * exibe em kg, então passe o valor bruto em kg aqui e use `weight: 'kg'`
 * no template.
 */
export interface HistoricoTreinoResumo {
  id: string;
  titulo: string;
  quando: string;
  duracaoMinutos: number | null;
  volumeTotalKg: number;
}

/**
 * Volume acumulado do mês corrente, exibido no card "Volume do mês" do Perfil.
 * Não é um contador salvo que precisa ser "zerado" na virada do mês: o
 * back-end deve calcular sempre "desde o 1º dia do mês corrente até hoje",
 * então no dia 1 a janela já reinicia sozinha (não há sessão anterior a
 * contar) — ver ProfileService.getPerfilCompleto.
 */
export interface PerfilVolumeMensal {
  volumeTon: number;
  totalTreinos: number;
}
