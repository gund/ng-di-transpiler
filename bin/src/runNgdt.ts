import { compileFiles } from './compiler/compiler';
import { getFinalConfig } from './config';
import { log, warn, error } from './logging';
import { resolveFiles } from './resolver';
import { ParsedArgs } from 'minimist';

export function runNgdt(command: ParsedArgs): void {
  const config = getFinalConfig(command);
  const files = resolveFiles(config.files, config.postfix + '.ts');

  if (!files.length) {
    warn({ code: 10, args: ['No files found for transpiling'] });
    process.exit(0);
  }

  if (compileFiles(files, config)) {
    log('Transpilation completed');
  } else {
    error({ args: ['Transpilation failed'] });
  }
}
