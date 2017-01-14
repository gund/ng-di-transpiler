import { DEFAULT_CONFIG } from './config';
import help from './help.md';

export const {version, homepage, displayName} = require('../package.json');

export function renderHelp(): string {
  return help
    .replace('__VERSION__', version)
    .replace('__DISPLAY_NAME__', displayName)
    .replace('__WIKI__', homepage)
    .replace('__CONF_TSCONFIG__', DEFAULT_CONFIG.tsconfigFile)
    .replace('__CONF_POSTFIX__', DEFAULT_CONFIG.postfix);
}
