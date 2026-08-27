/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
import type * as Types from './graphql-types';

import gql from 'graphql-tag';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type AutenticarComSenhaMutationVariables = Exact<{
  email: string;
  senha: string;
}>;

export type AutenticarComSenhaMutation = {
  autenticarComSenha: {
    accessToken: string;
    refreshToken: string;
    usuario: {
      id: string;
      pessoa: { id: string; nome: string; email: string } | null;
    };
  };
};

export type AutenticarComGoogleMutationVariables = Exact<{
  idToken: string;
}>;

export type AutenticarComGoogleMutation = {
  autenticarComGoogle: {
    accessToken: string;
    refreshToken: string;
    usuario: {
      id: string;
      pessoa: { id: string; nome: string; email: string } | null;
    };
  };
};

export type RegistrarMutationVariables = Exact<{
  input: Types.RegistrarInput;
}>;

export type RegistrarMutation = {
  registrar: {
    accessToken: string;
    refreshToken: string;
    usuario: {
      id: string;
      pessoa: { id: string; nome: string; email: string } | null;
    };
  };
};

export type GetExerciciosQueryVariables = Exact<{
  busca?: string | null | undefined;
  grupoMuscular?: string | null | undefined;
}>;

export type GetExerciciosQuery = {
  exercicios: Array<{
    id: string;
    nome: string;
    grupoMuscular: string | null;
    musculosSecundarios: Array<string>;
    cargaMaximaKg: number | null;
    permiteCarga: boolean;
    tipoExercicio: Types.TipoExercicio;
  }>;
};

export type GetExercicioByIdQueryVariables = Exact<{
  id: string | number;
}>;

export type GetExercicioByIdQuery = {
  exercicio: {
    id: string;
    nome: string;
    grupoMuscular: string | null;
    musculosSecundarios: Array<string>;
    cargaMaximaKg: number | null;
    permiteCarga: boolean;
    tipoExercicio: Types.TipoExercicio;
    historicoCargas: Array<{
      data: string;
      pesoKg: number | null;
      repeticoes: number | null;
    }>;
  } | null;
};

export type CriarExercicioMutationVariables = Exact<{
  input: Types.CriarExercicioInput;
}>;

export type CriarExercicioMutation = {
  criarExercicio: { id: string; nome: string; grupoMuscular: string | null };
};

export type GetMetricasResumoQueryVariables = Exact<{ [key: string]: never }>;

export type GetMetricasResumoQuery = {
  metricasResumo: {
    volumeSemanalTon: number;
    variacaoVolumePercentual: number;
    frequenciaSemanal: number;
    mediaFrequenciaSemanas: number;
    seriesConcluidas: number;
    ultimoTreinoTexto: string;
  };
};

export type GetEvolucaoVolumeQueryVariables = Exact<{ [key: string]: never }>;

export type GetEvolucaoVolumeQuery = {
  evolucaoVolume: Array<{ semana: string; volumeTon: number }>;
};

export type GetMelhoresMarcasQueryVariables = Exact<{ [key: string]: never }>;

export type GetMelhoresMarcasQuery = {
  melhoresMarcas: Array<{
    exercicioId: string;
    exercicioNome: string;
    cargaKg: number;
    repeticoes: number;
    diasAtras: number;
  }>;
};

export type GetRecordesIsometricosQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetRecordesIsometricosQuery = {
  recordesIsometricos: Array<{
    exercicioId: string;
    exercicioNome: string;
    maiorTempoSegundos: number;
    atingidoEm: string;
  }>;
};

export type GetPerfilPessoaQueryVariables = Exact<{ [key: string]: never }>;

export type GetPerfilPessoaQuery = {
  meuPerfil: {
    id: string;
    nome: string;
    email: string;
    fotoUrl: string | null;
    metaSemanalTreinos: number;
  } | null;
};

export type AtualizarPessoaMutationVariables = Exact<{
  input: Types.AtualizarPessoaInput;
}>;

export type AtualizarPessoaMutation = {
  atualizarPessoa: { id: string; nome: string; email: string };
};

export type GetHomeDashboardQueryVariables = Exact<{ [key: string]: never }>;

export type GetHomeDashboardQuery = {
  treinoHoje: {
    id: string;
    titulo: string;
    quantidadeExercicios: number;
    exerciciosResumo: string;
  } | null;
  suaSemana: {
    treinosRealizados: number;
    treinosMeta: number;
    volumeSemanalTon: number;
    variacaoVolumePercentual: number;
    frequenciaPercentual: number;
    seriesSemana: number;
  };
  ultimoTreino: {
    id: string;
    titulo: string;
    quando: string;
    duracaoMinutos: number | null;
    volumeTotalTon: number;
  } | null;
};

export type IniciarSessaoTreinoMutationVariables = Exact<{
  treinoId?: string | number | null | undefined;
}>;

export type IniciarSessaoTreinoMutation = {
  iniciarSessaoTreino: {
    id: string;
    status: Types.SessaoTreinoStatus;
    inicioEm: string;
  };
};

export type FinalizarSessaoTreinoMutationVariables = Exact<{
  sessaoId: string | number;
  dados: Types.FinalizarSessaoInput;
}>;

export type FinalizarSessaoTreinoMutation = {
  finalizarSessaoTreino: {
    id: string;
    status: Types.SessaoTreinoStatus;
    duracaoMinutos: number | null;
    volumeTotalKg: number | null;
  };
};

export type RegistrarSerieMutationVariables = Exact<{
  input: Types.RegistrarSerieInput;
}>;

export type RegistrarSerieMutation = {
  registrarSerie: {
    idSerie: string;
    idSessao: string;
    idExercicio: string;
    numeroSerie: number;
    repsRealizadas: number | null;
    tempoIsometriaSeg: number | null;
    tempoPausaIsometricaSeg: number | null;
    cargaAdicional: number | null;
    concluido: boolean;
    tipoExecucaoSinalizada: Types.TipoExecucaoSerie;
  };
};

export const AutenticarComSenhaDocument = gql`
  mutation AutenticarComSenha($email: String!, $senha: String!) {
    autenticarComSenha(email: $email, senha: $senha) {
      accessToken
      refreshToken
      usuario {
        id
        pessoa {
          id
          nome
          email
        }
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AutenticarComSenhaGQL extends Apollo.Mutation<
  AutenticarComSenhaMutation,
  AutenticarComSenhaMutationVariables
> {
  override document = AutenticarComSenhaDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AutenticarComGoogleDocument = gql`
  mutation AutenticarComGoogle($idToken: String!) {
    autenticarComGoogle(idToken: $idToken) {
      accessToken
      refreshToken
      usuario {
        id
        pessoa {
          id
          nome
          email
        }
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AutenticarComGoogleGQL extends Apollo.Mutation<
  AutenticarComGoogleMutation,
  AutenticarComGoogleMutationVariables
> {
  override document = AutenticarComGoogleDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RegistrarDocument = gql`
  mutation Registrar($input: RegistrarInput!) {
    registrar(input: $input) {
      accessToken
      refreshToken
      usuario {
        id
        pessoa {
          id
          nome
          email
        }
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class RegistrarGQL extends Apollo.Mutation<
  RegistrarMutation,
  RegistrarMutationVariables
> {
  override document = RegistrarDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GetExerciciosDocument = gql`
  query GetExercicios($busca: String, $grupoMuscular: String) {
    exercicios(busca: $busca, grupoMuscular: $grupoMuscular) {
      id
      nome
      grupoMuscular
      musculosSecundarios
      cargaMaximaKg
      permiteCarga
      tipoExercicio
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class GetExerciciosGQL extends Apollo.Query<
  GetExerciciosQuery,
  GetExerciciosQueryVariables
> {
  override document = GetExerciciosDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GetExercicioByIdDocument = gql`
  query GetExercicioById($id: ID!) {
    exercicio(id: $id) {
      id
      nome
      grupoMuscular
      musculosSecundarios
      cargaMaximaKg
      permiteCarga
      tipoExercicio
      historicoCargas {
        data
        pesoKg
        repeticoes
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class GetExercicioByIdGQL extends Apollo.Query<
  GetExercicioByIdQuery,
  GetExercicioByIdQueryVariables
> {
  override document = GetExercicioByIdDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const CriarExercicioDocument = gql`
  mutation CriarExercicio($input: CriarExercicioInput!) {
    criarExercicio(input: $input) {
      id
      nome
      grupoMuscular
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class CriarExercicioGQL extends Apollo.Mutation<
  CriarExercicioMutation,
  CriarExercicioMutationVariables
> {
  override document = CriarExercicioDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GetMetricasResumoDocument = gql`
  query GetMetricasResumo {
    metricasResumo {
      volumeSemanalTon
      variacaoVolumePercentual
      frequenciaSemanal
      mediaFrequenciaSemanas
      seriesConcluidas
      ultimoTreinoTexto
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class GetMetricasResumoGQL extends Apollo.Query<
  GetMetricasResumoQuery,
  GetMetricasResumoQueryVariables
> {
  override document = GetMetricasResumoDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GetEvolucaoVolumeDocument = gql`
  query GetEvolucaoVolume {
    evolucaoVolume {
      semana
      volumeTon
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class GetEvolucaoVolumeGQL extends Apollo.Query<
  GetEvolucaoVolumeQuery,
  GetEvolucaoVolumeQueryVariables
> {
  override document = GetEvolucaoVolumeDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GetMelhoresMarcasDocument = gql`
  query GetMelhoresMarcas {
    melhoresMarcas {
      exercicioId
      exercicioNome
      cargaKg
      repeticoes
      diasAtras
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class GetMelhoresMarcasGQL extends Apollo.Query<
  GetMelhoresMarcasQuery,
  GetMelhoresMarcasQueryVariables
> {
  override document = GetMelhoresMarcasDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GetRecordesIsometricosDocument = gql`
  query GetRecordesIsometricos {
    recordesIsometricos {
      exercicioId
      exercicioNome
      maiorTempoSegundos
      atingidoEm
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class GetRecordesIsometricosGQL extends Apollo.Query<
  GetRecordesIsometricosQuery,
  GetRecordesIsometricosQueryVariables
> {
  override document = GetRecordesIsometricosDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GetPerfilPessoaDocument = gql`
  query GetPerfilPessoa {
    meuPerfil {
      id
      nome
      email
      fotoUrl
      metaSemanalTreinos
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class GetPerfilPessoaGQL extends Apollo.Query<
  GetPerfilPessoaQuery,
  GetPerfilPessoaQueryVariables
> {
  override document = GetPerfilPessoaDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const AtualizarPessoaDocument = gql`
  mutation AtualizarPessoa($input: AtualizarPessoaInput!) {
    atualizarPessoa(input: $input) {
      id
      nome
      email
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AtualizarPessoaGQL extends Apollo.Mutation<
  AtualizarPessoaMutation,
  AtualizarPessoaMutationVariables
> {
  override document = AtualizarPessoaDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const GetHomeDashboardDocument = gql`
  query GetHomeDashboard {
    treinoHoje {
      id
      titulo
      quantidadeExercicios
      exerciciosResumo
    }
    suaSemana {
      treinosRealizados
      treinosMeta
      volumeSemanalTon
      variacaoVolumePercentual
      frequenciaPercentual
      seriesSemana
    }
    ultimoTreino {
      id
      titulo
      quando
      duracaoMinutos
      volumeTotalTon
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class GetHomeDashboardGQL extends Apollo.Query<
  GetHomeDashboardQuery,
  GetHomeDashboardQueryVariables
> {
  override document = GetHomeDashboardDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const IniciarSessaoTreinoDocument = gql`
  mutation IniciarSessaoTreino($treinoId: ID) {
    iniciarSessaoTreino(treinoId: $treinoId) {
      id
      status
      inicioEm
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class IniciarSessaoTreinoGQL extends Apollo.Mutation<
  IniciarSessaoTreinoMutation,
  IniciarSessaoTreinoMutationVariables
> {
  override document = IniciarSessaoTreinoDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const FinalizarSessaoTreinoDocument = gql`
  mutation FinalizarSessaoTreino(
    $sessaoId: ID!
    $dados: FinalizarSessaoInput!
  ) {
    finalizarSessaoTreino(sessaoId: $sessaoId, dados: $dados) {
      id
      status
      duracaoMinutos
      volumeTotalKg
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class FinalizarSessaoTreinoGQL extends Apollo.Mutation<
  FinalizarSessaoTreinoMutation,
  FinalizarSessaoTreinoMutationVariables
> {
  override document = FinalizarSessaoTreinoDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
export const RegistrarSerieDocument = gql`
  mutation RegistrarSerie($input: RegistrarSerieInput!) {
    registrarSerie(input: $input) {
      idSerie
      idSessao
      idExercicio
      numeroSerie
      repsRealizadas
      tempoIsometriaSeg
      tempoPausaIsometricaSeg
      cargaAdicional
      concluido
      tipoExecucaoSinalizada
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class RegistrarSerieGQL extends Apollo.Mutation<
  RegistrarSerieMutation,
  RegistrarSerieMutationVariables
> {
  override document = RegistrarSerieDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}
