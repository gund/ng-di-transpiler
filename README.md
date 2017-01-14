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

You can also customize transpiler by providing config in your `tsconfig.json`:
```json
{
  "ngdtOptions": {
    "files": string[],
    "postfix": string
  }
}
```

## Testing

To see it in action clone this repo do normal `npm install` and then run:
```bash
$ npm ngdt
```

And then take a look at `src/test` folder to see compiled files.

## Development

To build project run:

```bash
$ npm run build
```

No tests yet and so no coverage and no travis - so no automatic deployment =)  
Just yet!

## License

MIT © [Alex Malkevich](malkevich.alex@gmail.com)
