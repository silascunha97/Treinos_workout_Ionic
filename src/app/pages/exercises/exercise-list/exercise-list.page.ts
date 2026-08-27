import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForward, close, search } from 'ionicons/icons';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PillComponent } from '../../../shared/components/pill/pill.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ExerciseCatalogService } from '../../../features/exercises/services/exercise-catalog.service';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [RouterLink, FormsModule, IonContent, IonIcon, EmptyStateComponent, PillComponent, HeaderComponent],
  templateUrl: './exercise-list.page.html',
  styleUrls: ['./exercise-list.page.scss'],
})
export class ExerciseListPage {
  private readonly catalog = inject(ExerciseCatalogService);

  readonly query = signal('');
  readonly grupo = signal<string | null>(null);

  readonly grupos = this.catalog.gruposDisponiveis;
  readonly lista = this.catalog.exercicios;
  readonly status = this.catalog.status;

  constructor() {
    addIcons({ search, close, chevronForward });
  }

  buscar(): void {
    this.catalog.buscar({ busca: this.query(), grupoMuscular: this.grupo() });
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
}
