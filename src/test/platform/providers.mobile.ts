import { PlatformProviders, SomeClass1, SomeClass2 } from '../providers';
import { Test1Mobile } from '../test1';
import { Test2Mobile } from '../test2';

export const TOKENS: PlatformProviders = {
  token1: new SomeClass1(Test1Mobile),
  token2: new SomeClass2(Test2Mobile),
};
