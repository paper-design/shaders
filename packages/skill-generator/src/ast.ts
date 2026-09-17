import ts from 'typescript';
import type { StaticRecord, StaticValue } from './model.js';

export const unwrapExpression = (expression: ts.Expression): ts.Expression => {
  if (
    ts.isAsExpression(expression) ||
    ts.isSatisfiesExpression(expression) ||
    ts.isTypeAssertionExpression(expression) ||
    ts.isNonNullExpression(expression) ||
    ts.isParenthesizedExpression(expression)
  ) {
    return unwrapExpression(expression.expression);
  }

  return expression;
};

export const resolveSymbol = (checker: ts.TypeChecker, node: ts.Node): ts.Symbol | undefined => {
  const symbol = checker.getSymbolAtLocation(node);
  return symbol && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
};

export const variableInitializer = (symbol: ts.Symbol | undefined): ts.Expression | undefined =>
  symbol?.declarations
    ?.filter(ts.isVariableDeclaration)
    .map((declaration) => declaration.initializer)
    .find((initializer): initializer is ts.Expression => Boolean(initializer));

export const propertyName = (name: ts.PropertyName | ts.BindingName | undefined): string | undefined => {
  if (!name) return undefined;
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }

  return undefined;
};

export const objectProperty = (object: ts.ObjectLiteralExpression, name: string): ts.PropertyAssignment | undefined =>
  object.properties.filter(ts.isPropertyAssignment).find((property) => propertyName(property.name) === name);

export const exportedVariable = (sourceFile: ts.SourceFile, name: string): ts.VariableDeclaration | undefined =>
  sourceFile.statements
    .filter(ts.isVariableStatement)
    .filter((statement) => statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword))
    .flatMap((statement) => [...statement.declarationList.declarations])
    .find((declaration) => propertyName(declaration.name) === name);

export const interfaceDeclaration = (sourceFile: ts.SourceFile, name: string): ts.InterfaceDeclaration | undefined =>
  sourceFile.statements.filter(ts.isInterfaceDeclaration).find((declaration) => declaration.name.text === name);

export const typeAliasDeclaration = (sourceFile: ts.SourceFile, name: string): ts.TypeAliasDeclaration | undefined =>
  sourceFile.statements.filter(ts.isTypeAliasDeclaration).find((declaration) => declaration.name.text === name);

export const staticExpressionValue = (
  checker: ts.TypeChecker,
  input: ts.Expression,
  visited: ReadonlySet<ts.Node> = new Set()
): StaticValue | undefined => {
  const expression = unwrapExpression(input);
  if (visited.has(expression)) return undefined;
  const nextVisited = new Set(visited).add(expression);
  const literal = literalExpressionValue(expression);
  if (literal !== undefined) return literal;

  if (ts.isPrefixUnaryExpression(expression)) return unaryExpressionValue(checker, expression, nextVisited);
  if (ts.isArrayLiteralExpression(expression)) return arrayExpressionValue(checker, expression, nextVisited);
  if (ts.isObjectLiteralExpression(expression)) return objectExpressionValue(checker, expression, nextVisited);
  if (ts.isIdentifier(expression)) return identifierExpressionValue(checker, expression, nextVisited);
  if (ts.isPropertyAccessExpression(expression)) return propertyAccessExpressionValue(checker, expression, nextVisited);
  if (ts.isBinaryExpression(expression)) return binaryExpressionValue(checker, expression, nextVisited);

  return undefined;
};

export const sourceStaticValue = (input: ts.Expression): StaticValue | undefined => {
  const expression = unwrapExpression(input);
  const literal = literalExpressionValue(expression);
  if (literal !== undefined) return literal;
  if (ts.isPrefixUnaryExpression(expression)) {
    const value = sourceStaticValue(expression.operand);
    return typeof value === 'number' && expression.operator === ts.SyntaxKind.MinusToken ? -value : value;
  }
  if (ts.isArrayLiteralExpression(expression)) {
    const values = expression.elements.map((element) =>
      ts.isExpression(element) ? sourceStaticValue(element) : undefined
    );
    return values.every((value) => value !== undefined) ? (values as StaticValue[]) : undefined;
  }
  return undefined;
};

export const isStaticRecord = (value: StaticValue | undefined): value is StaticRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const literalExpressionValue = (expression: ts.Expression): StaticValue | undefined => {
  if (ts.isStringLiteralLike(expression)) return expression.text;
  if (ts.isNumericLiteral(expression)) return Number(expression.text);
  if (expression.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (expression.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (expression.kind === ts.SyntaxKind.NullKeyword) return null;
  return undefined;
};

const unaryExpressionValue = (
  checker: ts.TypeChecker,
  expression: ts.PrefixUnaryExpression,
  visited: ReadonlySet<ts.Node>
): StaticValue | undefined => {
  const value = staticExpressionValue(checker, expression.operand, visited);
  if (typeof value !== 'number') return undefined;
  if (expression.operator === ts.SyntaxKind.MinusToken) return -value;
  if (expression.operator === ts.SyntaxKind.PlusToken) return value;
  return undefined;
};

const arrayExpressionValue = (
  checker: ts.TypeChecker,
  expression: ts.ArrayLiteralExpression,
  visited: ReadonlySet<ts.Node>
): StaticValue[] | undefined => {
  const values = expression.elements.map((element) =>
    ts.isSpreadElement(element) ? undefined : staticExpressionValue(checker, element, visited)
  );
  return values.every((value) => value !== undefined) ? (values as StaticValue[]) : undefined;
};

const objectExpressionValue = (
  checker: ts.TypeChecker,
  expression: ts.ObjectLiteralExpression,
  visited: ReadonlySet<ts.Node>
): StaticRecord | undefined =>
  expression.properties.reduce<StaticRecord | undefined>(
    (result, property) => mergeObjectProperty(checker, result, property, visited),
    {}
  );

const mergeObjectProperty = (
  checker: ts.TypeChecker,
  record: StaticRecord | undefined,
  property: ts.ObjectLiteralElementLike,
  visited: ReadonlySet<ts.Node>
): StaticRecord | undefined => {
  if (!record) return undefined;
  if (ts.isSpreadAssignment(property)) {
    const spread = staticExpressionValue(checker, property.expression, visited);
    return isStaticRecord(spread) ? { ...record, ...spread } : undefined;
  }
  if (ts.isPropertyAssignment(property)) {
    const name = propertyName(property.name);
    const value = staticExpressionValue(checker, property.initializer, visited);
    return name && value !== undefined ? { ...record, [name]: value } : undefined;
  }
  if (ts.isShorthandPropertyAssignment(property)) {
    const value = staticExpressionValue(checker, property.name, visited);
    return value !== undefined ? { ...record, [property.name.text]: value } : undefined;
  }
  return record;
};

const identifierExpressionValue = (
  checker: ts.TypeChecker,
  expression: ts.Identifier,
  visited: ReadonlySet<ts.Node>
): StaticValue | undefined => {
  const initializer = variableInitializer(resolveSymbol(checker, expression));
  return initializer ? staticExpressionValue(checker, initializer, visited) : undefined;
};

const propertyAccessExpressionValue = (
  checker: ts.TypeChecker,
  expression: ts.PropertyAccessExpression,
  visited: ReadonlySet<ts.Node>
): StaticValue | undefined => {
  const object = staticExpressionValue(checker, expression.expression, visited);
  return isStaticRecord(object) ? object[expression.name.text] : undefined;
};

const binaryExpressionValue = (
  checker: ts.TypeChecker,
  expression: ts.BinaryExpression,
  visited: ReadonlySet<ts.Node>
): number | undefined => {
  const left = staticExpressionValue(checker, expression.left, visited);
  const right = staticExpressionValue(checker, expression.right, visited);
  return typeof left === 'number' && typeof right === 'number'
    ? numericBinaryValue(expression.operatorToken.kind, left, right)
    : undefined;
};

const numericBinaryValue = (operator: ts.SyntaxKind, left: number, right: number): number | undefined => {
  if (operator === ts.SyntaxKind.PlusToken) return left + right;
  if (operator === ts.SyntaxKind.MinusToken) return left - right;
  if (operator === ts.SyntaxKind.AsteriskToken) return left * right;
  if (operator === ts.SyntaxKind.SlashToken) return left / right;
  return undefined;
};
