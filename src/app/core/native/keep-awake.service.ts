import { Injectable, signal } from '@angular/core';
import { KeepAwake } from '@capacitor-community/keep-awake';

@Injectable({
  providedIn: 'root',
})
export class KeepAwakeService {
  readonly isKeptAwake = signal<boolean>(false);

  async keepAwake(): Promise<void> {
    try {
      await KeepAwake.keepAwake();
      this.isKeptAwake.set(true);
    } catch (e) {
      console.warn('KeepAwake não suportado no ambiente atual', e);
    }
  }

  async allowSleep(): Promise<void> {
    try {
      await KeepAwake.allowSleep();
      this.isKeptAwake.set(false);
    } catch (e) {
      console.warn('KeepAwake não suportado no ambiente atual', e);
    }
  }
}