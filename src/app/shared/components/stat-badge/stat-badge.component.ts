import { Component, computed, input } from '@angular/core';

/** Card compacto de estatística (label + valor grande + unidade + dica), usado em home/perfil/métricas. */
@Component({
  selector: 'app-stat-badge',
  standalone: true,
  template: `
    <div [class]="cardClass()">
      <p class="label-caps">{{ label() }}</p>
      <p [class]="valueClass()">
        {{ value() }}
        @if (unit()) {
          <span class="ml-1 text-xs font-semibold tracking-normal text-muted-foreground">{{ unit() }}</span>
        }
      </p>
      @if (hint()) {
        <p class="mt-1 text-xs text-muted-foreground">{{ hint() }}</p>
      }
    </div>
  `,
  styles: [':host { display: contents; }'],
})
export class StatBadgeComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly unit = input<string | undefined>(undefined);
  readonly hint = input<string | undefined>(undefined);
  readonly accent = input(false);

  readonly cardClass = computed(() =>
    this.accent() ? 'surface-card p-4 border-primary/30 bg-primary/5' : 'surface-card p-4',
  );
  readonly valueClass = computed(() => (this.accent() ? 'num mt-2 text-3xl text-primary' : 'num mt-2 text-3xl text-foreground'));
}
