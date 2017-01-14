import { existsSync } from 'fs';
import * as glob from 'glob';
import * as path from 'path';

export function resolveFiles(fileGlobs: string[], compiledName: string): string[] {
  const cwd = process.cwd();
  return fileGlobs
    .map(file => glob.sync(file))
    .reduce((arr, files) => [...arr, ...files], [])
    .filter(file => !file.endsWith(compiledName))
    .map(file => path.isAbsolute(file) ? file : path.resolve(cwd, file))
    .map(normalizePath);
}

export function normalizePath(path: string): string {
  return normalizeDelimiters(path).toLowerCase();
}

export function normalizeDelimiters(path: string): string {
  return path.replace(/\\/g, '/');
}

export function getFilePath(file: string): string {
  return normalizePath(path.parse(file).dir);
}

// Gratefully lifted from 'look-up', due to problems using it directly:
//   https://github.com/jonschlinkert/look-up/blob/master/index.js
//   MIT Licenced
export function findFile(filename: string): string {
  filename = path.normalize(filename);
  let cwd = process.cwd();
  let fp = cwd ? (cwd + path.sep + filename) : filename;

  if (existsSync(fp)) {
    return fp;
  }

  const segs = cwd.split(path.sep);
  let len = segs.length;

  while (len--) {
    cwd = segs.slice(0, len).join(path.sep);
    fp = cwd + path.sep + filename;
    if (existsSync(fp)) {
      return fp;
    }
  }

  return null;
}
