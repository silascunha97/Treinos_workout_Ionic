import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApolloClientOptions, InMemoryCache, ApolloLink } from '@apollo/client/core';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors';
import { HttpLink } from 'apollo-angular/http';
import { environment } from '../../../environments/environment';
import { toNativeUrl } from '../utils/native-url.util';
import { AuthStore } from '../auth/auth.store';
import { TokenService } from '../auth/token.service';
import { StorageService } from '../native/storage.service';

/** Verdadeiro se o erro indica sessão inválida/expirada — em qualquer um dos
 * dois formatos que o backend pode devolver: erro GraphQL com
 * `extensions.code === 'UNAUTHENTICATED'` (200 OK, corpo com `errors`), ou
 * um HTTP 401 puro (`ServerError`, sem corpo GraphQL — visto na prática
 * quando o token expira em vez de estar simplesmente ausente).
 */
function isSessaoExpirada(error: unknown): boolean {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.some((e) => e.extensions?.['code'] === 'UNAUTHENTICATED');
  }
  return ServerError.is(error) && error.statusCode === 401;
}

export function createApollo(): ApolloClientOptions {
  const httpLink = inject(HttpLink);
  const router = inject(Router);
  const authStore = inject(AuthStore);
  const tokenService = inject(TokenService);
  const storage = inject(StorageService);

  // Evita disparar o "clean up" mais de uma vez se várias queries falharem
  // com 401 juntas (ex.: GetHomeDashboard + GetEvolucaoVolume em paralelo).
  let tratandoSessaoExpirada = false;

  async function tratarSessaoExpirada(): Promise<void> {
    if (tratandoSessaoExpirada) return;
    tratandoSessaoExpirada = true;
    try {
      await tokenService.removeToken();
      await tokenService.removeRefreshToken();
      await storage.remove('user_session');
      authStore.setUnauthenticated('Sua sessão expirou. Entre novamente para continuar.');
      // Não chama `client.clearStore()` aqui: o próprio client que carrega
      // este link ainda está processando o erro que disparou este handler —
      // limpar o cache dele nesse ponto pode reentrar no fluxo de erro. O
      // cache fica limpo no próximo login/logout explícito (ver AuthService).
      await router.navigate(['/auth/login']);
    } finally {
      tratandoSessaoExpirada = false;
    }
  }

  // 1. Link para tratamento e log centralizado de erros do Apollo / GraphQL
  const errorLink = new ErrorLink(({ error }) => {
    if (isSessaoExpirada(error)) {
      console.warn('[Auth] Sessão expirada/token inválido — redirecionando para login.');
      void tratarSessaoExpirada();
      return;
    }

    if (CombinedGraphQLErrors.is(error)) {
      error.errors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL Error]: Mensagem: ${message} | Local: ${JSON.stringify(locations)} | Path: ${path}`
        );
      });
    } else {
      console.error(`[Network Error]: Falha de conexão com a API GraphQL`, error);
    }
  });

  // 2. Link HTTP apontando para o endpoint configurado no environment
  const http = httpLink.create({
    uri: toNativeUrl(environment.graphqlUrl),
  });

  // 3. Composição em cadeia dos Links do Apollo
  return {
    link: ApolloLink.from([errorLink, http]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
      },
      query: {
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  };
}
