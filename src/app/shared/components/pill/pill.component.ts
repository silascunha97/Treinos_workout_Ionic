import { Component, computed, input } from '@angular/core';

export type PillTone = 'neutral' | 'accent' | 'success' | 'warning' | 'error' | 'info';

/** Badge pequeno arredondado (status, tags) — equivalente ao `Pill` do protótipo. */
@Component({
  selector: 'app-pill',
  standalone: true,
  template: `
    <span [class]="classes()">
      @if (pulse()) {
        <span class="size-1.5 animate-pulse rounded-full bg-current"></span>
      }
      <ng-content></ng-content>
    </span>
  `,
  styles: [':host { display: contents; }'],
})
export class PillComponent {
  readonly tone = input<PillTone>('neutral');
  readonly pulse = input(false);

  private readonly toneClass = computed(() => {
    const map: Record<PillTone, string> = {
      neutral: 'bg-secondary text-muted-foreground',
      accent: 'bg-primary/15 text-primary',
      success: 'bg-success/15 text-success',
      warning: 'bg-warning/15 text-warning',
      error: 'bg-destructive/15 text-destructive',
      info: 'bg-info/15 text-info',
    };
    return map[this.tone()];
  });

  readonly classes = computed(
    () =>
      `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${this.toneClass()}`,
  );
}
