import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

/**
 * Cache síncrono de `Device.getInfo().isVirtual`, resolvido uma única vez
 * durante o bootstrap (ver `initNativeUrlDetection()` em `main.ts`) — porque
 * `toNativeUrl()` precisa ser síncrona (é chamada na configuração do Apollo
 * e em outros pontos que não são `async`).
 *
 * `null` = ainda não resolvido (assume-se dispositivo físico/navegador, ou
 * seja, NÃO reescreve `localhost`; reescrever incorretamente é pior do que
 * não reescrever, já que quebra o caso mais comum — device físico via USB).
 */
let isVirtualDevice: boolean | null = null;

/**
 * Deve ser chamada uma vez, antes de `bootstrapApplication`, para resolver
 * se o app está rodando no emulador Android (AVD) ou em hardware real.
 */
export async function initNativeUrlDetection(): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return;

  try {
    const info = await Device.getInfo();
    isVirtualDevice = info.isVirtual;
  } catch {
    // Plugin indisponível por algum motivo — mantém o padrão seguro (não reescreve).
    isVirtualDevice = false;
  }
}

/**
 * Ajusta URLs que apontam para `localhost` quando o app roda dentro do
 * emulador Android (AVD do Android Studio) — e SOMENTE nesse caso.
 *
 * Dentro do emulador, `localhost`/`127.0.0.1` se refere ao próprio
 * dispositivo virtual, não à máquina host onde o backend (ex.: GraphQL em
 * `http://localhost:4000`) está rodando. O Android Emulator expõe o
 * loopback do host através do alias especial `10.0.2.2`.
 *
 * Isso explica sintomas como "funciona no navegador mas dá erro/credenciais
 * inválidas no emulador": a requisição nem chega ao backend, falha como erro
 * de rede, e a UI acaba mostrando uma mensagem genérica de erro de login.
 *
 * Em dispositivo físico `10.0.2.2` NÃO existe/não resolve — por isso a
 * reescrita só acontece quando `Device.getInfo().isVirtual` confirma que é
 * o emulador (ver `initNativeUrlDetection()`). No device físico, `localhost`
 * é mantido como está: rode `adb reverse tcp:<porta> tcp:<porta>` (mesmo
 * padrão já usado pra porta 8100 do dev server, ver `.vscode/tasks.json`)
 * pra cada porta do backend antes de testar, ou troque `environment.ts`
 * pelo IP da máquina na rede local.
 */
export function toNativeUrl(url: string): string {
  if (Capacitor.getPlatform() === 'android' && isVirtualDevice) {
    return url.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
  }
  return url;
}
