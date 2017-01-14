import { warn } from './logging';
import { findFile } from './resolver';
import { readFileSync } from 'fs';
import { ParsedArgs } from 'minimist';
import { readConfigFile } from 'typescript';

export interface NgdtConfig {
  files: string[];
  tsconfigFile: string;
  postfix: string;
}

export const DEFAULT_CONFIG: NgdtConfig = {
  tsconfigFile: 'tsconfig.json',
  files: ['src/**/providers.*.ts'],
  postfix: '.compiled'
};

export function getFinalConfig(command: ParsedArgs): NgdtConfig {
  const cliConfig = getCliConfig(command);
  const tsConfig = getFromTsConfig(cliConfig.tsconfigFile || DEFAULT_CONFIG.tsconfigFile);

  // Make sure CLI config is the win
  return Object.assign({}, DEFAULT_CONFIG, tsConfig, cliConfig);
}

function getCliConfig(command: ParsedArgs): NgdtConfig {
  const config = {} as NgdtConfig;

  if (command['config']) {
    config.tsconfigFile = command['config'];
  }
  if (command['postfix']) {
    config.postfix = command['postfix'];
  }
  if (command._.length) {
    config.files = command._;
  }

  return config;
}

function getFromTsConfig(tsconfigFile: string): NgdtConfig {
  const {config, error} =
    readConfigFile(findFile(tsconfigFile), path => readFileSync(path, 'utf-8'));

  if (error) {
    // Show warn only if explicitly another config was used
    if (tsconfigFile !== DEFAULT_CONFIG.tsconfigFile) {
      warn({ code: 1, args: ['Failed to get tsconfig file\n', error.code, error.messageText] });
    }
    return <any>{};
  }

  if (!config || !config.ngdtOptions) {
    // Show warn only if explicitly another config was used
    if (tsconfigFile !== DEFAULT_CONFIG.tsconfigFile) {
      warn({ code: 2, args: [`'ngdtOptions' not found in '${tsconfigFile}'`] });
    }
    return <any>{};
  }

  return config.ngdtOptions;
}
