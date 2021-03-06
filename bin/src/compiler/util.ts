import { version } from '../help';
import { normalizePath } from '../resolver';
import { writeFileSync } from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const FILE_PREAMB = `
/** DO NOT EDIT. This file was auto generated by ngdt v${version} */
// tslint:disable
`.trim();

export interface ImportNotation {
  path: string;
  names: string[];
}

export function isNodeExported(node: ts.Node): boolean {
  return (node.flags & ts.NodeFlags.ExportContext) !== 0 ||
    (node.parent && node.parent.kind === ts.SyntaxKind.SourceFile);
}

export function isNodeOfKind(kind: ts.SyntaxKind): (node: ts.Node) => boolean {
  return node => node.kind === kind;
}

export function getClassMembers(classType: ts.Type): ts.Map<ts.Symbol> {
  if (classType.symbol.valueDeclaration.kind !==
    ts.SyntaxKind.ClassDeclaration) {
    throw Error(`Expected class ${classType.symbol.name} to be ClassDeclaration`);
  }

  const members: ts.Map<ts.Symbol> = Object.create(null);
  const baseClasses = classType.getBaseTypes();

  if (baseClasses && baseClasses.length) {
    baseClasses.forEach(
      baseClass => Object.assign(members, getClassMembers(baseClass)));
  }

  Object.assign(members, classType.symbol.members);

  return members;
}

export function getPropertyDeclaration(symbol: ts.Symbol):
  ts.PropertyDeclaration {
  return symbol.declarations[0] as ts.PropertyDeclaration;
}

export function getNodeType(declList: ts.Node): string {
  if ((declList.flags & ts.NodeFlags.Const) !== 0) {
    return 'const';
  } else if ((declList.flags & ts.NodeFlags.Let) !== 0) {
    return 'let';
  } else {
    return 'var';
  }
}

export function stripStringExpressionName(expr: ts.Expression): string {
  if (!expr) {
    return '';
  }

  const name = expr.getText();

  if (expr.kind === ts.SyntaxKind.StringLiteral) {
    return name.replace(/\'/g, '');
  } else {
    return name;
  }
}

export function getExpressionImport(
  expr: ts.Expression, checker: ts.TypeChecker, prog: ts.Program, relativeTo?: string): ImportNotation {
  if (expr.kind !== ts.SyntaxKind.Identifier) {
    return null;
  }

  const fullPath = resolveIdentifierLocation(<any>expr, checker, prog);
  const pathTo = fullPath.replace('.ts', '');
  const name = expr.getText();

  return {
    names: [name], path: normalizePath(path.relative(relativeTo, pathTo))
  };
}

export function optimizeImports(imports: ImportNotation[]): ImportNotation[] {
  const importsMap: { [k: string]: string[] } = Object.create(null);

  imports.forEach(({path, names}) => {
    if (!importsMap[path]) {
      importsMap[path] = [...names];
    } else {
      importsMap[path].push(...names);
    }
  });

  return Object.keys(importsMap).map(path => ({
    path,
    names: importsMap[path].filter(
      (name, i, arr) => arr.indexOf(name) === i)
  }));
}

export function renderImports(imports: ImportNotation[]): string {
  const optimizedImports = optimizeImports(imports);
  const importTpl = `import {$names} from '$path';`;

  return optimizedImports
    .map(
    ({path, names}) => importTpl.replace('$names', names.join(', '))
      .replace('$path', path))
    .join('\n');
}

export function renderProviders(providers: string[], name: string, varType: string): string {
  const startStr = `export ${varType} ${name} = [\n  `;
  const endStr = `\n];`;
  return startStr + providers.join(',\n  ') + endStr;
}

export function renderImportsAndProviders(file: string, imports: string, providers: string) {
  const content = `${FILE_PREAMB}\n${imports}\n\n${providers}\n`;
  writeFileSync(file, content);
}

const isNodeVariableStatement = isNodeOfKind(ts.SyntaxKind.VariableStatement);

export function getExportedVarOfType(stmts: ts.NodeArray<ts.Statement>, type: string, checker: ts.TypeChecker): ts.VariableStatement {
  const vars = stmts.filter((node: ts.VariableStatement) =>
    isNodeExported(node) &&
    isNodeVariableStatement(node) &&
    isTypeNodeOfType(node.declarationList.declarations[0].type, type, checker));

  if (!vars.length) {
    throw Error(`No exported variables of type '${type}' found`);
  }

  if (vars.length > 1) {
    throw Error(`More than one variable of type '${type}' found`);
  }

  return vars.shift() as ts.VariableStatement;
}

export function isTypeNodeOfType(typeNode: ts.TypeNode, typeStr: string, checker: ts.TypeChecker): boolean {
  // Check direct type
  if (typeNode.getText() === typeStr) {
    return true;
  }

  const type = checker.getTypeAtLocation(typeNode);
  const baseType = type.getBaseTypes();

  // Check inherited types
  return baseType.some(t => t.symbol.name === typeStr);
}

export function normalizeDelimiters(path: string): string {
  return path.replace(/\\/g, '/');
}

export function getBasedirFromFile(file: string): string {
  return normalizeDelimiters(path.parse(file).dir);
}

export function resolveIdentifierLocation(identifier: ts.Identifier, checker: ts.TypeChecker, prog: ts.Program): string {
  const symbol = checker.getSymbolAtLocation(identifier);
  const sourceFile = identifier.getSourceFile();
  let location = sourceFile.fileName;

  if (symbol.getDeclarations()[0].kind === ts.SyntaxKind.ImportSpecifier) {
    const importDecl = getIdentifierImport(identifier, sourceFile.statements);

    if (importDecl) {
      const newLoc = mergeFilenameWithExpression(location, importDecl.moduleSpecifier);
      const newFile = resolveRelativeTsFile(newLoc, prog);

      if (newFile) {
        location = newFile.fileName;
      }
    }
  }

  return location;
}

export function mergeFilenameWithExpression(fileName: string, expr: ts.Expression): string {
  return normalizePath(path.normalize(getBasedirFromFile(fileName) + '/' + stripStringExpressionName(expr)));
}

export function resolveRelativeTsFile(fileName: string, prog: ts.Program): ts.SourceFile {
  return prog.getSourceFile(fileName) ||
    prog.getSourceFile(fileName + '.ts') ||
    prog.getSourceFile(fileName + '.tsx') ||
    prog.getSourceFile(fileName + '/index.tsx') ||
    prog.getSourceFile(fileName + '/index.ts');
}

export function getIdentifierImport(identifier: ts.Identifier, stmts: ts.NodeArray<ts.Statement>): ts.ImportDeclaration {
  const identText = identifier.getText();
  const importStmts = <ts.NodeArray<ts.ImportDeclaration>>
    stmts.filter(isNodeOfKind(ts.SyntaxKind.ImportDeclaration));

  return importStmts
    .filter(s => {
      if (s.importClause.name) {
        return s.importClause.name.getText() === identText;
      }
      if (s.importClause.namedBindings) {
        if (s.importClause.namedBindings.kind === ts.SyntaxKind.NamespaceImport) {
          return s.importClause.namedBindings.name.getText() === identText;
        }
        if (s.importClause.namedBindings.kind === ts.SyntaxKind.NamedImports) {
          return s.importClause.namedBindings.elements.some(i => i.getText() === identText);
        }
      }
      return false;
    })
    .shift();
}
