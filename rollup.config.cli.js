import json from 'rollup-plugin-json';
import string from 'rollup-plugin-string';
import typescriptPlugin from 'rollup-plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import fs from 'fs';
import typescript from 'typescript';

export default {
  entry: 'bin/src/index.ts',
  dest: 'bin/ngdt',
  format: 'cjs',
  banner: '#!/usr/bin/env node',
  plugins: [
    string({ include: 'bin/**/*.md' }),
    json(),
    typescriptPlugin(Object.assign({typescript}), getTsConfig()),
    commonjs({
      include: 'node_modules/**'
    }),
    nodeResolve({
      main: true
    })
  ],
  external: [
    'path',
    'fs',
    'glob',
    'typescript',
    'minimist',
  ]
};

function getTsConfig() {
  try {
    const config = fs.readFileSync('tsconfig.cli.json', 'utf-8');
    return JSON.parse(config).compilerOptions;
  } catch (e) {
    console.warn('WARN: tsconfig file was not used due to:\n' + e.message);
    return {};
  }
}
