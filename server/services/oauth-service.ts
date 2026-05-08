import axios from 'axios';
import type { AppConfig } from '../config';

export interface OAuthService {
  exchangeCodeForToken(code: string): Promise<string>;
}

export function createOAuthService(config: AppConfig): OAuthService {
  return {
    async exchangeCodeForToken(code: string) {
      const tokenUrl = `${config.openemrUrl}/oauth2/default/token`;
      const tokenRes = await axios.post(
        tokenUrl,
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: config.oauthClientId,
          client_secret: config.oauthClientSecret,
          code,
          redirect_uri: config.redirectUri,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );
      const { access_token: token, scope: grantedScope } = tokenRes.data ?? {};
      if (typeof token !== 'string' || !token) {
        throw new Error('Token response missing access_token');
      }
      if (typeof grantedScope === 'string') {
        console.info('OAuth token granted scopes:', grantedScope);
      } else {
        console.warn('OAuth token response did not include a scope field');
      }
      return token;
    },
  };
}
