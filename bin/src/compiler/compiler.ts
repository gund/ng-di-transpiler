import { DEFAULT_MULTI, DEFAULT_PROVIDEAS } from '../../../src/token-provider';
import { TOKEN_PROVIDERS_STRING } from '../../../src/token-providers';
import { NgdtConfig } from '../config';
import { error, log } from '../logging';
import { normalizePath } from '../resolver';
import {
  getBasedirFromFile,
  getClassMembers,
  getExportedVarOfType,
  getExpressionImport,
  getNodeType,
  getPropertyDeclaration,
  ImportNotation,
  isNodeOfKind,
  renderImports,
  renderImportsAndProviders,
  renderProviders,
  stripStringExpressionName
} from './util';
import * as ts from 'typescript';

const isNodePropertyAssignment = isNodeOfKind(ts.SyntaxKind.PropertyAssignment);

export function compileFiles(files: string[], config: NgdtConfig): boolean {
  return files.every(file => {
    try {
      file = normalizePath(file);
      const path = getBasedirFromFile(file);
      log('Transpiling file ' + file);
      compileFile(file, path, config);
      log('OK');
      return true;
    } catch (e) {
      error({ code: e.code || 1, args: [e], recover: true });
      return false;
    }
  });
}

export function compileFile(fileName: string, path: string, config: NgdtConfig): void {
  const program = ts.createProgram([fileName],
    { target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS });
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(fileName);

  const varStmt = getExportedVarOfType(sourceFile.statements, TOKEN_PROVIDERS_STRING, checker);

  const declarations = varStmt.declarationList.declarations;

  if (!declarations.length) {
    throw Error(`No declarations of type '${TOKEN_PROVIDERS_STRING}' found`);
  }

  const declaration = declarations[0];
  const init = declaration.initializer;

  if (init.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
    throw Error('Initializer is not an Object Literal');
  }

  const name = declaration.name;
  const varType = getNodeType(varStmt.declarationList);
  const properties = <ts.PropertyDeclaration[]>(<any>init)
    .properties.filter(isNodePropertyAssignment);

  if (!properties.length) {
    throw Error('No properties found');
  }

  const providers = properties.map(prop => {
    const initializer = <ts.NewExpression>prop.initializer;

    if (initializer.kind !== ts.SyntaxKind.NewExpression) {
      throw Error('Expected initializer to be NewExpression');
    }

    const expr = <ts.Identifier>initializer.expression;
    const args = <ts.NodeArray<ts.Identifier>>initializer.arguments;

    if (!args.length) {
      throw Error('No arguments provided to token class');
    }

    const valueIdentifier = args[0];
    const tokenInfo = collectTokenInfo(expr, valueIdentifier, checker);

    return generateProviderFromTokenInfo(
      tokenInfo.tokenSymbol, valueIdentifier, tokenInfo.tokenMembers, checker, program, path);
  });

  const imports = providers
    .reduce((arr, p) => [...arr, ...p.imports], [])
    .filter(i => !!i);

  const providersStr = renderProviders(
    providers.map(p => p.providerStr), name.getText(), varType);
  const importsStr = renderImports(imports);

  const newFile = fileName.replace('.ts', `${config.postfix}.ts`);

  renderImportsAndProviders(newFile, importsStr, providersStr);
}

export function collectTokenInfo(
  tokenClass: ts.Identifier, providedValue: ts.Identifier,
  checker: ts.TypeChecker) {
  if (tokenClass.kind !== ts.SyntaxKind.Identifier ||
    providedValue.kind !== ts.SyntaxKind.Identifier) {
    throw Error('Token and Value should be Identifiers');
  }

  const tokenSymbol = checker.getSymbolAtLocation(tokenClass);
  const valueSymbol = checker.getSymbolAtLocation(providedValue);

  const tokenType = checker.getDeclaredTypeOfSymbol(tokenSymbol);

  const tokenMembers = getClassMembers(tokenType);

  if (!tokenMembers['provide']) {
    throw Error(`No 'provide' property found`);
  }
  if (!tokenMembers['provideAs']) {
    throw Error(`No 'provideAs' property found`);
  }
  if (!tokenMembers['deps']) {
    throw Error(`No 'deps' property found`);
  }
  if (!tokenMembers['multi']) {
    throw Error(`No 'multi' property found`);
  }

  Object.keys(tokenMembers)
    .map(name => tokenMembers[name])
    .filter(
    member => !member.valueDeclaration ||
      member.valueDeclaration.kind !==
      ts.SyntaxKind.PropertyDeclaration)
    .forEach(member => delete tokenMembers[member.name]);

  return { tokenSymbol, valueSymbol, tokenMembers };
}

export function generateProviderFromTokenInfo(
  tokenSymbol: ts.Symbol, valueIdentifier: ts.Identifier,
  tokenMembers: ts.Map<ts.Symbol>, checker: ts.TypeChecker, prog: ts.Program, path: string) {
  const provideSymbol = tokenMembers['provide'];
  const provideAsSymbol = tokenMembers['provideAs'];
  const depsSymbol = tokenMembers['deps'];
  const multiSymbol = tokenMembers['multi'];

  const provideDecl = getPropertyDeclaration(provideSymbol);
  const provideAsDecl = getPropertyDeclaration(provideAsSymbol);
  const depsDecl = getPropertyDeclaration(depsSymbol);
  const multiDecl = getPropertyDeclaration(multiSymbol);

  const provideStr = provideDecl.initializer.getText();
  const provideAsStr = stripStringExpressionName(provideAsDecl.initializer) || DEFAULT_PROVIDEAS;
  const depsStr = depsDecl.initializer ? depsDecl.initializer.getText() : 'undefined';
  const multiStr = multiDecl.initializer ? multiDecl.initializer.getText() : `${DEFAULT_MULTI}`;
  const valueStr = valueIdentifier.getText();

  const depsFullStr = depsStr === 'undefined' ? '' : `, deps: ${depsStr}`;
  const multiFullStr = multiStr === `${DEFAULT_MULTI}` ? '' : `, multi: ${multiStr}`;

  const providerStr = `{provide: ${provideStr}, ${provideAsStr}: ${valueStr}${depsFullStr}${multiFullStr}}`;

  const imports = [provideDecl.initializer, valueIdentifier];

  const depsInitializer = depsDecl.initializer || <any>{};
  if (depsInitializer.kind === ts.SyntaxKind.ArrayLiteralExpression) {
    imports.push(...(<any>depsInitializer).elements);
  }

  return { providerStr, imports: getImportsFor(imports, checker, prog, path) };
}

export function getImportsFor(
  expressions: ts.Expression[], checker: ts.TypeChecker, prog: ts.Program, path: string): ImportNotation[] {
  return expressions.map(expr => getExpressionImport(expr, checker, prog, path));
}
