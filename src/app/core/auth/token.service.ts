import { inject, Injectable } from '@angular/core';
import { StorageService } from '../native/storage.service';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly storage = inject(StorageService);
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  async setToken(token: string): Promise<void> {
    await this.storage.set(this.TOKEN_KEY, token);
  }

  async getToken(): Promise<string | null> {
    return await this.storage.get<string>(this.TOKEN_KEY);
  }

  async removeToken(): Promise<void> {
    await this.storage.remove(this.TOKEN_KEY);
  }

  /**
   * Guardado para quando o back-end publicar uma mutation de renovação (ver
   * PROBLEMA ENCONTRADO no relatório de integração: `AuthPayload.refreshToken`
   * já existe no schema, mas não há nenhuma mutation que o receba de volta —
   * então hoje ele só fica persistido, sem uso ativo de renovação silenciosa).
   */
  async setRefreshToken(token: string): Promise<void> {
    await this.storage.set(this.REFRESH_TOKEN_KEY, token);
  }

  async getRefreshToken(): Promise<string | null> {
    return await this.storage.get<string>(this.REFRESH_TOKEN_KEY);
  }

  async removeRefreshToken(): Promise<void> {
    await this.storage.remove(this.REFRESH_TOKEN_KEY);
  }
}
