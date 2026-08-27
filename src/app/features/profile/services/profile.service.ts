import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  GetMelhoresMarcasGQL,
  GetMetricasResumoGQL,
  GetPerfilPessoaGQL,
} from '../../../graphql/generated/graphql';
import {
  HistoricoTreinoResumo,
  PerfilEstatisticas,
  PerfilUsuario,
  PerfilVolumeMensal,
} from '../models/profile.model';

export interface PerfilCompleto {
  usuario: PerfilUsuario | null;
  estatisticas: PerfilEstatisticas;
  historico: HistoricoTreinoResumo[];
  volumeMensal: PerfilVolumeMensal;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly perfilGql = inject(GetPerfilPessoaGQL);
  private readonly melhoresMarcasGql = inject(GetMelhoresMarcasGQL);
  private readonly metricasResumoGql = inject(GetMetricasResumoGQL);

  /**
   * Agrega os dados exibidos na tela de Perfil.
   *
   * `nome`, `email`, `fotoUrl`, `totalRecordes` (via `melhoresMarcas`) e os cards
   * de estatística vêm de queries reais do back-end. Os cards de estatística usam
   * `metricasResumo`, que é o mesmo agregado da tela de Métricas — calculado pelo
   * back-end sobre os últimos 7 dias (ver `frequenciaSemanal`/`volumeSemanalTon`),
   * não um total histórico da conta. É por isso que a seção leva o rótulo
   * "Últimos 7 dias" no template: o schema atual não expõe um total histórico
   * (ex.: `meuResumoTotal`) — se/quando existir, trocar aqui.
   *
   * O histórico recente detalhado (lista de sessões) segue mock: o schema não tem
   * uma query de lista (ex.: `meusTreinosRecentes(desde: DateTime): [SessaoResumo]`),
   * só agregados semanais e o `ultimoTreino` isolado. Ver `getHistoricoMock`.
   *
   * `volumeMensal` (card "Volume do mês") também segue mock pelo mesmo motivo:
   * o schema não tem um agregado mensal. Ver `getVolumeMensalMock`.
   *
   * `historico[].volumeTotalKg` está em kg (diferente de `estatisticas.volumeTotalTon`,
   * que está em toneladas) — ver doc de `HistoricoTreinoResumo`.
   */
  getPerfilCompleto(): Observable<PerfilCompleto> {
    return forkJoin({
      pessoa: this.perfilGql.fetch(),
      marcas: this.melhoresMarcasGql.fetch(),
      metricas: this.metricasResumoGql.fetch(),
    }).pipe(
      map(({ pessoa, marcas, metricas }) => {
        const dadosPessoa = pessoa.data?.meuPerfil;

        const usuario: PerfilUsuario | null = dadosPessoa
          ? {
              id: dadosPessoa.id,
              nome: dadosPessoa.nome,
              email: dadosPessoa.email,
              fotoUrl: dadosPessoa.fotoUrl ?? null,
              metaSemanalTreinos: dadosPessoa.metaSemanalTreinos,
              // TODO: substituir por campos reais quando o back-end expuser tempo de conta/streak
              treinandoDesdeMeses: 14,
              treinosPorSemanaMedia: dadosPessoa.metaSemanalTreinos || 3,
            }
          : null;

        const dadosMetricas = metricas.data?.metricasResumo;

        const estatisticas: PerfilEstatisticas = {
          // Últimos 7 dias (agregado pelo back-end), não total histórico — ver nota acima.
          totalTreinos: dadosMetricas?.frequenciaSemanal ?? 0,
          volumeTotalTon: dadosMetricas?.volumeSemanalTon ?? 0,
          totalRecordes: marcas.data?.melhoresMarcas?.length ?? 0,
        };

        return {
          usuario,
          estatisticas,
          historico: this.getHistoricoMock(),
          volumeMensal: this.getVolumeMensalMock(),
        };
      })
    );
  }

  /**
   * TODO: substituir pelo histórico real assim que existir uma query de lista
   * (ex.: `meusTreinosRecentes(desde: DateTime): [SessaoResumo]`) retornando as
   * últimas sessões finalizadas — ideal filtrando por `desde: hoje - 7 dias`
   * pra manter a mesma janela "últimos 7 dias" usada nos cards acima.
   */
  private getHistoricoMock(): HistoricoTreinoResumo[] {
    return [
      { id: '1', titulo: 'Peito e tríceps', quando: 'Ontem · 19:10', duracaoMinutos: 58, volumeTotalKg: 8400 },
      { id: '2', titulo: 'Pernas', quando: 'Seg · 07:20', duracaoMinutos: 66, volumeTotalKg: 11300 },
      { id: '3', titulo: 'Costas e bíceps', quando: 'Sáb · 10:05', duracaoMinutos: 52, volumeTotalKg: 7700 },
    ];
  }

  /**
   * TODO: substituir por uma query real (ex.: `meuResumoMensal { volumeTon
   * totalTreinos }`) assim que o back-end expuser esse agregado — calculado
   * lá como "desde o 1º dia do mês corrente até hoje". Feito assim, o card
   * "reinicia" sozinho a cada mês, sem precisar de nenhuma rotina de reset:
   * no dia 1 ainda não há sessão nenhuma dentro da janela.
   */
  private getVolumeMensalMock(): PerfilVolumeMensal {
    return { volumeTon: 3.6, totalTreinos: 9 };
  }
}
