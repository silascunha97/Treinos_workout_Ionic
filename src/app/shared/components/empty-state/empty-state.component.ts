import { Component, input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

/** Estado vazio padrão: ícone + título + texto + ação projetada (`<ng-content>`). */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IonIcon],
  template: `
    <div class="flex flex-col items-center px-6 py-14 text-center">
      <div class="grid size-16 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        <ion-icon [name]="icon()" class="text-2xl"></ion-icon>
      </div>
      <h3 class="mt-4 text-lg font-bold text-foreground">{{ title() }}</h3>
      <p class="mt-1.5 max-w-[16rem] text-sm text-muted-foreground">{{ text() }}</p>
      <div class="mt-5 w-full max-w-[16rem]">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [':host { display: contents; }'],
})
export class EmptyStateComponent {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly text = input.required<string>();
}
