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

Via CLI available as `ngdt`.

To integrate with your build run this command just before build begins.

By default it will look and transpile file matching globe `src/**/providers.*.ts`.  
Generated files will live along originals but named `%file_name%.compiled.ts`.

For CLI usage run `ngdt -h`.

## Development

To build project run:

```bash
$ npm run build
```

No tests yet and so no coverage and no travis - so no automatic deployment =)  
Just yet!

## License

MIT © [Alex Malkevich](malkevich.alex@gmail.com)
