import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formata uma duração em minutos como "58 min" (abaixo de 1h) ou "1h 06" (1h ou mais).
 */
@Pipe({
  name: 'duration',
  standalone: true,
})
export class DurationPipe implements PipeTransform {
  transform(minutos: number | null | undefined): string {
    if (minutos === null || minutos === undefined) return '—';

    if (minutos < 60) return `${minutos} min`;

    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    return `${horas}h ${minutosRestantes.toString().padStart(2, '0')}`;
  }
}
