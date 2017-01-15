export interface Type<T> extends Function {
  new (...args: any[]): T;
}

export const DEFAULT_PROVIDEAS = 'useClass' as string;
export const DEFAULT_MULTI = false;

/**
 * @description
 * Keeps Token (@prop provide) and required implementation (T) in pair
 * Validates that provided (@prop value) is correct
 */
export abstract class TokenProvider<T> {
  abstract provide: any;
  provideAs = DEFAULT_PROVIDEAS;
  deps = [];
  multi = DEFAULT_MULTI;
  constructor(public value: Type<T>) { }
}

/**
 * @experimental
 * @description
 * Helps inject token and use its declared type interface
 */
export function interfaceAsType<T>(i: T): Type<T> {
  return new Object() as Type<T>;
}
