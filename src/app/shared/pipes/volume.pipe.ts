import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formata um volume em kg — sempre em quilos, nunca em toneladas. Abaixo de
 * 1000 kg mostra o número inteiro puro ("240 kg"); a partir de 1000 kg usa
 * notação compacta com "k" ("2,6k kg" em vez de "2600 kg"). Em ambos os
 * casos o valor é truncado (não arredondado) e sem separador de milhar.
 *
 * Cobre volumes de qualquer escala (ex.: volume acumulado de um treino em
 * andamento). Ver também `WeightPipe`, usado nos totais semanais/perfil.
 */
@Pipe({
  name: 'volume',
  standalone: true,
})
export class VolumePipe implements PipeTransform {
  private static readonly KG_POR_MIL = 1000;

  transform(kg: number | null | undefined): string {
    if (kg === null || kg === undefined) return '—';

    if (Math.abs(kg) < VolumePipe.KG_POR_MIL) {
      return `${Math.trunc(kg)} kg`;
    }

    const milhares = Math.trunc((kg / VolumePipe.KG_POR_MIL) * 10) / 10;
    return `${milhares.toFixed(1).replace('.', ',')}k kg`;
  }
}
