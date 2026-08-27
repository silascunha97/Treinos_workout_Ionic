export interface VolumePorSemana {
  label: string;
  value: number;
}

export interface RecordePessoal {
  exercise: string;
  value: string;
  detail: string;
}

/**
 * Melhor tempo sustentado (segundos) por exercício isométrico — query
 * `recordesIsometricos`. O backend consolida o recorde automaticamente como
 * efeito colateral de `registrarSerie` (ver `ProcessarRecordeIsometricoUseCase`
 * na API), mesmo padrão de `melhoresMarcas` (força dinâmica), só que pra
 * séries com `tipoExecucaoSinalizada: ISOMETRICA`.
 */
export interface IsometricRecord {
  exercicioId: string;
  exercicioNome: string;
  melhorTempoSeg: number;
  atingidoEm: string;
}
