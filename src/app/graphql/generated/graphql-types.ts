export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type AtualizarPessoaInput = {
  altura?: InputMaybe<Scalars['Float']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  fotoUrl?: InputMaybe<Scalars['String']['input']>;
  metaSemanalTreinos?: InputMaybe<Scalars['Int']['input']>;
  nome?: InputMaybe<Scalars['String']['input']>;
  peso?: InputMaybe<Scalars['Float']['input']>;
  taxaMetabolicaBasal?: InputMaybe<Scalars['Float']['input']>;
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
  usuario: Usuario;
};

export type CriarExercicioInput = {
  grupoMuscular?: InputMaybe<Scalars['String']['input']>;
  musculosSecundarios?: InputMaybe<Array<Scalars['String']['input']>>;
  nome: Scalars['String']['input'];
  permiteCarga?: InputMaybe<Scalars['Boolean']['input']>;
};

export type EvolucaoVolumeSemana = {
  __typename?: 'EvolucaoVolumeSemana';
  semana: Scalars['String']['output'];
  volumeTon: Scalars['Float']['output'];
};

export type Exercicio = {
  __typename?: 'Exercicio';
  cargaMaximaKg?: Maybe<Scalars['Float']['output']>;
  grupoMuscular?: Maybe<Scalars['String']['output']>;
  historicoCargas: Array<HistoricoCarga>;
  id: Scalars['ID']['output'];
  musculosSecundarios: Array<Scalars['String']['output']>;
  nome: Scalars['String']['output'];
  permiteCarga: Scalars['Boolean']['output'];
  tipoExercicio: TipoExercicio;
};

export type FinalizarSessaoInput = {
  observacoes?: InputMaybe<Scalars['String']['input']>;
};

export type HistoricoCarga = {
  __typename?: 'HistoricoCarga';
  data: Scalars['String']['output'];
  pesoKg?: Maybe<Scalars['Float']['output']>;
  repeticoes?: Maybe<Scalars['Int']['output']>;
};

export type MelhorMarca = {
  __typename?: 'MelhorMarca';
  cargaKg: Scalars['Float']['output'];
  diasAtras: Scalars['Int']['output'];
  exercicioId: Scalars['ID']['output'];
  exercicioNome: Scalars['String']['output'];
  repeticoes: Scalars['Int']['output'];
};

export type MetricasResumo = {
  __typename?: 'MetricasResumo';
  frequenciaSemanal: Scalars['Int']['output'];
  mediaFrequenciaSemanas: Scalars['Float']['output'];
  seriesConcluidas: Scalars['Int']['output'];
  ultimoTreinoTexto: Scalars['String']['output'];
  variacaoVolumePercentual: Scalars['Float']['output'];
  volumeSemanalTon: Scalars['Float']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  atualizarPessoa: Pessoa;
  autenticarComGoogle: AuthPayload;
  autenticarComSenha: AuthPayload;
  criarExercicio: Exercicio;
  finalizarSessaoTreino: SessaoTreinoResumo;
  iniciarSessaoTreino: SessaoTreinoResumo;
  registrar: AuthPayload;
  registrarSerie: Serie;
};

export type MutationAtualizarPessoaArgs = {
  input: AtualizarPessoaInput;
};

export type MutationAutenticarComGoogleArgs = {
  idToken: Scalars['String']['input'];
};

export type MutationAutenticarComSenhaArgs = {
  email: Scalars['String']['input'];
  senha: Scalars['String']['input'];
};

export type MutationCriarExercicioArgs = {
  input: CriarExercicioInput;
};

export type MutationFinalizarSessaoTreinoArgs = {
  dados: FinalizarSessaoInput;
  sessaoId: Scalars['ID']['input'];
};

export type MutationIniciarSessaoTreinoArgs = {
  treinoId?: InputMaybe<Scalars['ID']['input']>;
};

export type MutationRegistrarArgs = {
  input: RegistrarInput;
};

export type MutationRegistrarSerieArgs = {
  input: RegistrarSerieInput;
};

export type Pessoa = {
  __typename?: 'Pessoa';
  altura?: Maybe<Scalars['Float']['output']>;
  email: Scalars['String']['output'];
  fotoUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  metaSemanalTreinos: Scalars['Int']['output'];
  nome: Scalars['String']['output'];
  peso?: Maybe<Scalars['Float']['output']>;
  taxaMetabolicaBasal?: Maybe<Scalars['Float']['output']>;
};

export type Query = {
  __typename?: 'Query';
  evolucaoVolume: Array<EvolucaoVolumeSemana>;
  exercicio?: Maybe<Exercicio>;
  exercicios: Array<Exercicio>;
  healthCheck: Scalars['String']['output'];
  melhoresMarcas: Array<MelhorMarca>;
  metricasResumo: MetricasResumo;
  meuPerfil?: Maybe<Pessoa>;
  recordesIsometricos: Array<RecordeIsometrico>;
  suaSemana: SuaSemana;
  treinoHoje?: Maybe<TreinoResumo>;
  ultimoTreino?: Maybe<UltimoTreinoResumo>;
};

export type QueryExercicioArgs = {
  id: Scalars['ID']['input'];
};

export type QueryExerciciosArgs = {
  busca?: InputMaybe<Scalars['String']['input']>;
  grupoMuscular?: InputMaybe<Scalars['String']['input']>;
};

export type RecordeIsometrico = {
  __typename?: 'RecordeIsometrico';
  atingidoEm: Scalars['String']['output'];
  exercicioId: Scalars['ID']['output'];
  exercicioNome: Scalars['String']['output'];
  maiorTempoSegundos: Scalars['Int']['output'];
};

export type RegistrarInput = {
  email: Scalars['String']['input'];
  nome: Scalars['String']['input'];
  senha: Scalars['String']['input'];
};

export type RegistrarSerieInput = {
  cargaAdicional?: InputMaybe<Scalars['Float']['input']>;
  concluido?: InputMaybe<Scalars['Boolean']['input']>;
  idExercicio: Scalars['ID']['input'];
  idSessao: Scalars['ID']['input'];
  numeroSerie: Scalars['Int']['input'];
  repsRealizadas?: InputMaybe<Scalars['Int']['input']>;
  tempoIsometriaSeg?: InputMaybe<Scalars['Int']['input']>;
  tempoPausaIsometricaSeg?: InputMaybe<Scalars['Int']['input']>;
};

export type Serie = {
  __typename?: 'Serie';
  cargaAdicional?: Maybe<Scalars['Float']['output']>;
  concluido: Scalars['Boolean']['output'];
  idExercicio: Scalars['ID']['output'];
  idSerie: Scalars['ID']['output'];
  idSessao: Scalars['ID']['output'];
  numeroSerie: Scalars['Int']['output'];
  repsRealizadas?: Maybe<Scalars['Int']['output']>;
  tempoIsometriaSeg?: Maybe<Scalars['Int']['output']>;
  tempoPausaIsometricaSeg?: Maybe<Scalars['Int']['output']>;
  tipoExecucaoSinalizada: TipoExecucaoSerie;
};

export type SessaoTreinoResumo = {
  __typename?: 'SessaoTreinoResumo';
  duracaoMinutos?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  inicioEm: Scalars['String']['output'];
  status: SessaoTreinoStatus;
  volumeTotalKg?: Maybe<Scalars['Float']['output']>;
};

export enum SessaoTreinoStatus {
  EmAndamento = 'EM_ANDAMENTO',
  Finalizada = 'FINALIZADA',
}

export type SuaSemana = {
  __typename?: 'SuaSemana';
  frequenciaPercentual: Scalars['Float']['output'];
  seriesSemana: Scalars['Int']['output'];
  treinosMeta: Scalars['Int']['output'];
  treinosRealizados: Scalars['Int']['output'];
  variacaoVolumePercentual: Scalars['Float']['output'];
  volumeSemanalTon: Scalars['Float']['output'];
};

export enum TipoExecucaoSerie {
  Dinamica = 'DINAMICA',
  DinamicaComPausaIsometrica = 'DINAMICA_COM_PAUSA_ISOMETRICA',
  Isometrica = 'ISOMETRICA',
}

export enum TipoExercicio {
  Dinamico = 'DINAMICO',
  Hibrido = 'HIBRIDO',
  Isometrico = 'ISOMETRICO',
}

export type TreinoResumo = {
  __typename?: 'TreinoResumo';
  exerciciosResumo: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  quantidadeExercicios: Scalars['Int']['output'];
  titulo: Scalars['String']['output'];
};

export type UltimoTreinoResumo = {
  __typename?: 'UltimoTreinoResumo';
  duracaoMinutos?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  quando: Scalars['String']['output'];
  titulo: Scalars['String']['output'];
  volumeTotalTon: Scalars['Float']['output'];
};

export type Usuario = {
  __typename?: 'Usuario';
  id: Scalars['ID']['output'];
  pessoa?: Maybe<Pessoa>;
};
