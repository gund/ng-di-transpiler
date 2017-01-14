import { TokenProvider, TokenProviders } from '../';
import { Test1 } from './test1';
import { Test2 } from './test2';

export interface PlatformProviders extends TokenProviders {
  token1: SomeClass1;
  token2: SomeClass2;
}

export const SOME_TOKEN = new Object();

export class SomeClass1 extends TokenProvider<Test1> {
  provide = SOME_TOKEN;
  multi = true;
}

export class SomeClass2 extends TokenProvider<Test2> {
  provide = '123';
  provideAs = 'useFactory';
  deps = [SOME_TOKEN, 'fff'];
}
