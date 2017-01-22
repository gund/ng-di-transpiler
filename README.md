# ng-di-transpiler

> DI Transpiler for Angular

[![Npm](https://img.shields.io/npm/v/ng-di-transpiler.svg?maxAge=2592000)](https://badge.fury.io/js/ng-di-transpiler)
[![Npm Downloads](https://img.shields.io/npm/dt/ng-di-transpiler.svg?maxAge=2592000)](https://www.npmjs.com/package/ng-di-transpiler)
[![Licence](https://img.shields.io/npm/l/ng-di-transpiler.svg?maxAge=2592000)](https://github.com/gund/ng-di-transpiler/blob/master/LICENSE)

This is still in early stages but fully functional already.

## What and Why?

See [this](https://github.com/gund/ioc-compiler-poc#about).

## Installation

```bash
$ npm install ng-di-transpiler --save
```

## Usage

### Integration

1. Fist you need to define interface of all platform tokens required in your app.  
  To do so create interface that extends from `TokenProviders` from this library.  
 Extending is necessary because that's how library will know where to get tokens.

2. Create classes for each token extending from `TokenProvider<T>` and providing
 interface that real entity should implement by replacing `T`.

3. Set properties to interface created in step #1 with types created in step #2.  
 In this way you will guarantee correctness of provided tokens for each platform.

4. Create as many `providers.%platform%.ts` files as you need and export from there
const of type interface you created in step #1 and provide all tokens for platform.

5. Load platform specific file `providers.%platform%.compiled.ts` into your application
providers.

You can always customize which files to transpile and what postfix for transpiled files to use.

### Transpilation

Via CLI available as `ngdt`.

To integrate with your build run this command just before build begins.

By default it will look and transpile file matching globe `src/**/providers.*.ts`.  
Generated files will live along originals but named `%file_name%.compiled.ts`.

For CLI usage run `ngdt -h`.

You can also customize transpiler by providing `ngdtOptions` in your `tsconfig.json`:
```json
{
  "ngdtOptions": {
    "files": string[],
    "postfix": string
  }
}
```

## Example use-case

Suppose your app requires some interfaces to be provided to different platforms.  
We will start off be specifying wich providers should be provided and what interfaces they should implement:
```ts
// ./src/core/platform/platform-tokens.ts
import { TokenProviders, TokenProvider } from 'ng-di-transpiler';
import { CONSOLE_TOKEN, ConsoleInterface } from './console'; // <-- Here are some definitions
import { STORAGE_TOKEN, StorageInterface } from './storage'; // <-- of interfaces and tokens to provide

export interface PlatformTokens extends TokenProviders {
  console: ConsoleProvider;
  storage: StorageProvider;
}

export class ConsoleProvider extends TokenProvider<ConsoleInterface> {
  provider: CONSOLE_TOKEN; // <-- This might be instance of `OpaqueToken`
}

export class StorageProvider extends TokenProvider<StorageInterface> {
  provider: STORAGE_TOKEN; // <-- This is yet another instance of `OpaqueToken`
}
```

Now it's time to provide real implementations for each specific platform.
Let's do first for Browser:
```ts
// ./src/core/platform/providers.browser.ts
import { PlatformTokens, ConsoleProvider, StorageProvider } from './platform-tokens';
import { ConsoleLogger } from './browser/console-logger'; // <-- Get platform specific
import { LocalStorage } from './browser/local-storage';   // <-- implementations

export const TOKENS: PlatformTokens = { // <-- Type is important here: 1. For type based analysis; 2. To detect right variable to compile
  console: new ConsoleProvider(ConsoleLogger);
  storage: new StorageProvider(LocalStorage);
};
```

Now let's provide implementations maybe for mobile:
```ts
// ./src/core/platform/providers.mobile.ts
import { PlatformTokens, ConsoleProvider, StorageProvider } from './platform-tokens';
import { MobileLogger } from './mobile/logger';   // <-- Get platform specific
import { MobileStorage } from './mobile/storage'; // <-- implementations

export const TOKENS: PlatformTokens = { // <-- Same interface here will remind us to provide everything our app needs and with right implementations!
  console: new ConsoleProvider(MobileLogger);
  storage: new StorageProvider(MobileStorage);
};
```

Thanks to this structure we can easily manage large amount of tokens for different platforms
ae we will get static analisys of our tokens.  

If we will run `ngdt` against this files above, we will have next files generated:
- ./src/core/platform/providers.browser.compiled.ts (from providers.browser.ts)
- ./src/core/platform/providers.mobile.compiled.ts (from providers.mobile.ts)

So we can safely include one of them depending for which platform we compiling our app.  
We can keep our target platform in global variable `TARGET` and provide it at compile time
via Webpack's `DefinePlugin` or some similar technique and create next final file for platform tokens:
```ts
// ./src/core/platform/index.ts
let PLATFORM_TOKENS = [];

if (TARGET === 'browser') {
  PLATFORM_TOKENS = require('./providers.browser.compiled.ts').TOKENS || [];
} else if (TARGET === 'mobile') {
  PLATFORM_TOKENS = require('./providers.mobile.compiled.ts').TOKENS || [];
}

export { PLATFORM_TOKENS };
```

NOTE: We could use `import` statements here but Webpack would not eliminate those unused imports so
`require` will make sure that our final bundle will have only neccessary tokens for selected platform.

And then we just consume our providers as usual in our AppModule:
```ts
// ./src/app.module.ts
import { PLATFORM_TOKENS } from './core/platform';

@NgModule({
  // ...Other config
  providers: [
    ...PLATFORM_TOKENS,
    // ...Other providers
  ]
})
export class AppModule { }
```

## Development

To build project run:

```bash
$ npm run build
```

No tests yet and so no coverage and no travis - so no automatic deployment =)  
Just yet!

## License

MIT © [Alex Malkevich](malkevich.alex@gmail.com)
