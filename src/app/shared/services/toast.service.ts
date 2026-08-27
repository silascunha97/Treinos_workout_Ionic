import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'info' | 'error';

export interface ActiveToast {
  id: number;
  text: string;
  tone: ToastTone;
}

const AUTO_DISMISS_MS = 2600;

/**
 * Estado do toast global do app, renderizado por `<app-toast>` (montado uma
 * única vez em `app.component.html`).
 *
 * Antes usava `ToastController` do Ionic (`ion-toast`), mas o `cssClass`
 * passado em `create()` só é aplicado ao elemento *host* de `ion-toast` — o
 * balão visível (`.toast-wrapper`) vive dentro do Shadow DOM do componente e
 * só pode ser restilizado via as custom properties que o Ionic expõe
 * (`--background`, `--border-radius` etc.), nunca por classes utilitárias
 * comuns. Por isso `cssClass: 'rounded-full'` (Tailwind) não tinha efeito
 * algum no formato real do toast, que ficava com o visual padrão do tema
 * (não o pill opaco pretendido) — causa raiz do "Série concluída" cortado/
 * deformado no topo da tela. Um overlay próprio em light DOM dá controle
 * total sobre Safe Area, z-index e opacidade (ver app-toast.component.ts).
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly active = signal<ActiveToast | null>(null);

  show(text: string, tone: ToastTone = 'success'): void {
    if (this.timer) clearTimeout(this.timer);

    const id = ++this.nextId;
    this.active.set({ id, text, tone });

    this.timer = setTimeout(() => {
      // Só limpa se ainda for este toast — evita que um `show()` mais
      // recente seja apagado pelo timer do anterior.
      if (this.active()?.id === id) this.active.set(null);
    }, AUTO_DISMISS_MS);
  }

  dismiss(): void {
    if (this.timer) clearTimeout(this.timer);
    this.active.set(null);
  }
}
