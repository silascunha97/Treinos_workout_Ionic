import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { HapticsService } from '../native/haptics.service';

export interface CanComponentDeactivate {
  hasActiveWorkout: () => boolean;
}

export const activeWorkoutGuard: CanDeactivateFn<CanComponentDeactivate> = async (component) => {
  const haptics = inject(HapticsService);

  // Se o componente reporta que existe um treino em andamento
  if (component.hasActiveWorkout && component.hasActiveWorkout()) {
    await haptics.impactMedium();
    
    const confirmExit = window.confirm(
      'Você tem um treino em andamento. Deseja realmente sair e pausar a sessão?'
    );

    return confirmExit;
  }

  return true;
};