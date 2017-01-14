import { PlatformProviders, SomeClass1, SomeClass2 } from '../providers';
import { Test1Browser } from '../test1';
import { Test2Browser } from '../test2';

export const TOKENS: PlatformProviders = {
  token1: new SomeClass1(Test1Browser),
  token2: new SomeClass2(Test2Browser),
};
