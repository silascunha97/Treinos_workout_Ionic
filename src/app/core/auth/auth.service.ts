import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  AutenticarComGoogleGQL,
  AutenticarComSenhaGQL,
  AutenticarComSenhaMutationVariables,
  RegistrarGQL
} from '../../../app/graphql/generated/graphql';
import { RegistrarInput } from '../../../app/graphql/generated/graphql-types';
import { TokenService } from '../../../app/core/auth/token.service';
import { StorageService } from '../../../app/core/native/storage.service';
import { AuthStore, UserProfile } from './auth.store';
import { Browser } from '@capacitor/browser';
import { toNativeUrl } from '../utils/native-url.util';

export interface UserSession {
  id: string;
  email: string;
  nome: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly loginGql = inject(AutenticarComSenhaGQL);
  private readonly tokenService = inject(TokenService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);
  private readonly apollo = inject(Apollo);

  // Estados reativos via Signals
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly currentUser = signal<UserSession | null>(null);

  private readonly googleGql = inject(AutenticarComGoogleGQL);
  private readonly registrarGql = inject(RegistrarGQL);
  private readonly authStore = inject(AuthStore);

  /**
   * Força a abertura do Google OAuth no Navegador do Sistema
   */
async loginWithGoogle(): Promise<void> {
    // Endpoint REST do backend que inicia o handshake OAuth 2.0
    const googleAuthUrl = toNativeUrl('http://localhost:3000/auth/google');

    await Browser.open({
      url: googleAuthUrl,
      windowName: '_system',
      toolbarColor: '#0b0c0e',
    });
  }


  /**
   * Troca o idToken recebido via Deep Link pelo token de sessão GraphQL
   */
  loginWithGoogleToken(idToken: string) {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.authStore.setLoading();

    this.googleGql.mutate({ variables: { idToken } }).subscribe({
      next: async (result) => {
        this.isLoading.set(false);
        const data = result.data?.autenticarComGoogle;
        const pessoa = data?.usuario?.pessoa;

        if (data?.accessToken && pessoa) {
          await this.saveUserSession(data.accessToken, data.refreshToken, pessoa);
          this.router.navigate(['/tabs/home']);
        } else {
          const errStr = 'Não foi possível carregar os dados do perfil.';
          this.errorMessage.set(errStr);
          this.authStore.setError(errStr);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const errStr = 'Falha na autenticação via Google.';
        this.errorMessage.set(errStr);
        this.authStore.setError(errStr);
      },
    });
  }

  /**
   * Executa a Mutation de Login com e-mail e senha no GraphQL
   */
  login(credentials: AutenticarComSenhaMutationVariables) {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.authStore.setLoading();

    return this.loginGql.mutate({ variables: credentials }).pipe(
      tap({
        next: async (result) => {
          this.isLoading.set(false);
          const data = result.data?.autenticarComSenha;
          const pessoa = data?.usuario?.pessoa;

          if (data?.accessToken && pessoa) {
            await this.saveUserSession(data.accessToken, data.refreshToken, pessoa);
            this.router.navigate(['/tabs/home']);
          } else {
            const errStr = 'Credenciais válidas, mas dados do perfil indisponíveis.';
            this.errorMessage.set(errStr);
            this.authStore.setError(errStr);
          }
        },
      }),
      catchError((err) => {
        this.isLoading.set(false);
        const msg = err?.message || 'E-mail ou senha incorretos. Tente novamente.';
        this.errorMessage.set(msg);
        this.authStore.setError(msg);
        return throwError(() => err);
      })
    );
  }

  /**
   * Executa a Mutation de Cadastro (nome, e-mail e senha) no GraphQL
   */
  register(dados: RegistrarInput) {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.authStore.setLoading();

    return this.registrarGql.mutate({ variables: { input: dados } }).pipe(
      tap({
        next: async (result) => {
          this.isLoading.set(false);
          const data = result.data?.registrar;
          const pessoa = data?.usuario?.pessoa;

          if (data?.accessToken && pessoa) {
            await this.saveUserSession(data.accessToken, data.refreshToken, pessoa);
            this.router.navigate(['/tabs/home']);
          } else {
            const errStr = 'Não foi possível concluir o cadastro. Tente novamente.';
            this.errorMessage.set(errStr);
            this.authStore.setError(errStr);
          }
        },
      }),
      catchError((err) => {
        this.isLoading.set(false);
        const msg = err?.message || 'Não foi possível criar sua conta. Tente novamente.';
        this.errorMessage.set(msg);
        this.authStore.setError(msg);
        return throwError(() => err);
      })
    );
  }

  /**
   * Revalida a sessão ativa ao abrir o app
   */
  async checkSession(): Promise<boolean> {
    const token = await this.tokenService.getToken();
    const user = await this.storage.get<UserSession>('user_session');

    if (token && user) {
      this.authStore.setAuthenticated(user);
      return true;
    }

    // Não sobrescreve uma mensagem já definida (ex.: "sessão expirada",
    // setada por core/graphql/apollo.config.ts ao ver um 401) — publicGuard
    // chama checkSession() bem na navegação para /auth/login que segue
    // aquele redirecionamento, e um `setUnauthenticated()` sem argumento
    // aqui apagaria a mensagem antes da tela de login conseguir mostrá-la.
    if (!this.authStore.error()) this.authStore.setUnauthenticated();
    return false;
  }

  /**
   * Limpa tokens do sessionStorage, limpa o Storage, zera o cache do Apollo
   * e desautentica a Store.
   *
   * O reset do cache Apollo é obrigatório aqui: sem ele, dados privados do
   * usuário que acabou de sair (ex.: resultado de `meuPerfil`/`suaSemana`
   * já normalizado no InMemoryCache) continuariam disponíveis para o
   * próximo usuário que logar neste mesmo aparelho, até que cada query
   * fosse refeita — uma janela real de vazamento de dados entre contas.
   */
  async logout(): Promise<void> {
    await this.tokenService.removeToken();
    await this.tokenService.removeRefreshToken();
    await this.storage.remove('user_session');
    await this.apollo.client.clearStore();
    this.authStore.setUnauthenticated();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Helper privado para centralizar a gravação do token e perfil
   */
  private async saveUserSession(accessToken: string, refreshToken: string, pessoa: UserProfile): Promise<void> {
    // 1. Grava o JWT (e o refresh token, para quando o back-end publicar a
    //    mutation de renovação — ver PROBLEMA ENCONTRADO no relatório)
    await this.tokenService.setToken(accessToken);
    await this.tokenService.setRefreshToken(refreshToken);

    // 2. Grava os dados do usuário para exibição local
    const session: UserSession = {
      id: pessoa.id,
      nome: pessoa.nome,
      email: pessoa.email,
    };
    await this.storage.set('user_session', session);

    // 3. Notifica a AuthStore global
    this.authStore.setAuthenticated(session);
  }

}