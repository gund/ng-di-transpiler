export interface Type<T> extends Function {
  new (...args: any[]): T;
}

/**
 * @description
 * Keeps Token (@prop provide) and required implementation (T) in pair
 * Validates that provided (@prop value) is correct
 */
export abstract class TokenProvider<T> {
  abstract provide: any;
  provideAs = 'useClass';
  deps = [];
  multi = false;
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
