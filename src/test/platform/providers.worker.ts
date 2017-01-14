import { PlatformProviders, SomeClass1, SomeClass2 } from '../providers';
import { Test1Worker } from '../test1';
import { Test2Worker } from '../test2';

export const TOKENS: PlatformProviders = {
  token1: new SomeClass1(Test1Worker),
  token2: new SomeClass2(Test2Worker),
};
