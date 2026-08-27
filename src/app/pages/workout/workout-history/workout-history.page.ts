import { Component, OnInit, inject, signal } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { WeightPipe } from '../../../shared/pipes/weight.pipe';
import { GetHomeDashboardGQL } from '../../../graphql/generated/graphql';

type UltimoTreino = { id: string; titulo: string; quando: string; duracaoMinutos: number | null; volumeTotalTon: number };

/**
 * BLOCKED BY BACKEND CONTRACT: o schema GraphQL não tem nenhuma query de
 * histórico paginado (ex.: `meusTreinosRecentes(limit)`) — só `ultimoTreino`,
 * que devolve um único item. Por isso esta tela mostra só o último treino,
 * em vez de fingir ter uma lista completa (o protótipo Lovable tinha um mock
 * com 4 itens fixos; isso foi removido de propósito).
 */
@Component({
  selector: 'app-workout-history',
  standalone: true,
  imports: [IonContent, HeaderComponent, WeightPipe],
  templateUrl: './workout-history.page.html',
  styleUrls: ['./workout-history.page.scss'],
})
export class WorkoutHistoryPage implements OnInit {
  private readonly homeDashboardGql = inject(GetHomeDashboardGQL);

  readonly ultimoTreino = signal<UltimoTreino | null | undefined>(undefined); // undefined = carregando

  ngOnInit(): void {
    this.homeDashboardGql.fetch({ fetchPolicy: 'cache-first' }).subscribe({
      next: ({ data }) => this.ultimoTreino.set(data?.ultimoTreino ?? null),
      error: () => this.ultimoTreino.set(null),
    });
  }
}
