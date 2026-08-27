import { Injectable, signal, WritableSignal } from '@angular/core';
import { Network, ConnectionStatus } from '@capacitor/network';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  readonly isOnline: WritableSignal<boolean> = signal(true);

  constructor() {
    this.initNetworkMonitoring();
  }

  private async initNetworkMonitoring(): Promise<void> {
    const status: ConnectionStatus = await Network.getStatus();
    this.isOnline.set(status.connected);

    Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
      this.isOnline.set(status.connected);
    });
  }
}