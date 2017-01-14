export interface LogMessage {
  args: any[];
  code?: number;
  recover?: boolean;
}

const logAny = console.log.bind(console);
const logErr = console.error.bind(console);

export function log(...args: any[]): void {
  logAny(...args);
  logAny('');
}

export function warn(msg: LogMessage): void {
  msg.code = _getCode(100, msg.code);
  _log('warn', msg);
}

export function error(msg: LogMessage): void {
  msg.code = _getCode(200, msg.code);
  _log('error', msg);
  if (!msg.recover) {
    process.exit(msg.code || 1);
  }
}

function _getCode(base: number, code = 0): number {
  return base + code;
}

function _log(type: 'warn' | 'error', msg: LogMessage): void {
  const codeStr = msg.code ? ` [${msg.code}]` : '';
  logErr(type.toUpperCase() + codeStr);
  logErr(...msg.args);
  logErr('');
}
