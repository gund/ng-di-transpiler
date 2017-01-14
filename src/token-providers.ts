import { TokenProvider } from './token-provider';

export interface TokenProviders {
  [k: string]: TokenProvider<any>;
}

export const TOKEN_PROVIDERS_STRING = 'TokenProviders';
