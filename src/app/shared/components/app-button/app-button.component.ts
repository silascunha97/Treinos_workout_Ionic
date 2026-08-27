import { Component, computed, input } from '@angular/core';

export type AppButtonVariant = 'primary' | 'ghost' | 'outline' | 'danger';

/**
 * Botão grande padrão do app (zona do polegar): alvo de toque mínimo de
 * 3.5rem, variantes de cor, estado disabled. Equivalente ao `BigButton` do
 * protótipo — implementado como `<button>` puro (não `ion-button`) porque é
 * assim que todo o resto do app já constrói CTAs (login, home, perfil), e
 * `ion-button` não dá o controle de altura/raio que esse design pede.
 */
@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button [type]="type()" [disabled]="disabled()" [class]="classes()">
      <ng-content></ng-content>
    </button>
  `,
  // Sem isso, o host (custom element, display:inline por padrão) vira uma caixa
  // própria que não "blockifica" fora de contextos flex/grid — o <button> interno
  // (w-full, bloco) fica maior que a caixa do host e cliques nele não registram
  // (o host intercepta). `display:contents` remove a caixa do host do layout.
  styles: [':host { display: contents; }'],
})
export class AppButtonComponent {
  readonly variant = input<AppButtonVariant>('primary');
  readonly disabled = input(false);
  readonly type = input<'button' | 'submit'>('button');
  readonly extraClass = input<string>('');

  private readonly variantClass = computed(() => {
    const map: Record<AppButtonVariant, string> = {
      primary: 'bg-primary text-primary-foreground',
      ghost: 'bg-secondary text-foreground',
      outline: 'border border-border bg-transparent text-foreground',
      danger: 'bg-destructive/15 text-destructive',
    };
    return map[this.variant()];
  });

  readonly classes = computed(
    () =>
      `tap flex w-full items-center justify-center gap-2 rounded-2xl px-5 text-base font-bold tracking-wide disabled:opacity-50 min-h-[3.5rem] ${this.variantClass()} ${this.extraClass()}`,
  );
}
