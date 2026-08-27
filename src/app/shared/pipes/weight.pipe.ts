import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formata um peso/volume em kg — sempre em quilos, nunca em toneladas.
 * Abaixo de 1000 kg mostra o número inteiro puro ("850 kg"); a partir de
 * 1000 kg usa notação compacta com "k" ("2,6k kg" em vez de "2600 kg"), pra
 * ficar curto mesmo em volumes grandes. Em ambos os casos o valor é
 * truncado (não arredondado) e sem separador de milhar — o "." nunca deve
 * ser lido como casa decimal.
 *
 * `unidade` descreve apenas em que unidade o `valor` de entrada está (o
 * back-end ainda manda alguns campos em toneladas, ex.: `volumeTon`), não a
 * unidade de saída, que é sempre kg. `casasDecimais` controla quantas casas
 * aparecem na notação compacta (padrão 1) — não tem efeito abaixo de 1000 kg.
 *
 * Ex.: transform(850, 'kg')      -> "850 kg"
 *      transform(2600, 'kg')     -> "2,6k kg"
 *      transform(11300, 'kg')    -> "11,3k kg"
 *      transform(1.24, 'ton')    -> "1,2k kg"
 *      transform(2600, 'kg', 0)  -> "2k kg"
 */
@Pipe({
  name: 'weight',
  standalone: true,
})
export class WeightPipe implements PipeTransform {
  private static readonly KG_POR_TONELADA = 1000;

  transform(valor: number | null | undefined, unidade: 'kg' | 'ton' = 'ton', casasDecimais = 1): string {
    if (valor === null || valor === undefined) return '—';

    const emKg = unidade === 'ton' ? valor * WeightPipe.KG_POR_TONELADA : valor;

    if (Math.abs(emKg) < WeightPipe.KG_POR_TONELADA) {
      return `${Math.trunc(emKg)} kg`;
    }

    const fator = 10 ** casasDecimais;
    const milhares = Math.trunc((emKg / WeightPipe.KG_POR_TONELADA) * fator) / fator;
    const formatado = milhares.toFixed(casasDecimais).replace('.', ',');

    return `${formatado}k kg`;
  }
}
