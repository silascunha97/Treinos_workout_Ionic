import { Component, input } from '@angular/core';
import { IonBackButton, IonButtons, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

/**
 * Cabeçalho padrão das telas internas (fora das abas): título + subtítulo
 * opcional + botão voltar opcional. Conteúdo projetado (`<ng-content select="[right]">`)
 * fica no lado direito da toolbar (ex.: botão de filtro, sync pill).
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="dark">
        @if (back()) {
          <ion-buttons slot="start">
            <ion-back-button [defaultHref]="defaultHref()"></ion-back-button>
          </ion-buttons>
        }
        <ion-title class="px-1">
          <span class="block truncate text-xl font-extrabold text-white">{{ title() }}</span>
          @if (subtitle()) {
            <span class="block truncate text-xs font-normal text-muted">{{ subtitle() }}</span>
          }
        </ion-title>
        <ion-buttons slot="end">
          <ng-content select="[right]"></ng-content>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
  `,
  styles: [':host { display: contents; }'],
})
export class HeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | undefined>(undefined);
  readonly back = input(false);
  readonly defaultHref = input('/tabs/home');
}
