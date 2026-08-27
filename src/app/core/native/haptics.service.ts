import { Injectable } from '@angular/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

@Injectable({
  providedIn: 'root',
})
export class HapticsService {
  async impactLight(): Promise<void> {
    await Haptics.impact({ style: ImpactStyle.Light });
  }

  async impactMedium(): Promise<void> {
    await Haptics.impact({ style: ImpactStyle.Medium });
  }

  async impactHeavy(): Promise<void> {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  }

  async notificationSuccess(): Promise<void> {
    await Haptics.notification({ type: NotificationType.Success });
  }

  async notificationError(): Promise<void> {
    await Haptics.notification({ type: NotificationType.Error });
  }

  async selectionChanged(): Promise<void> {
    await Haptics.selectionChanged();
  }
}