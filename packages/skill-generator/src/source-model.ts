import path from 'node:path';
import ts from 'typescript';
import {
  exportedVariable,
  interfaceDeclaration,
  isStaticRecord,
  objectProperty,
  propertyName,
  resolveSymbol,
  sourceStaticValue,
  staticExpressionValue,
  typeAliasDeclaration,
  unwrapExpression,
} from './ast.js';
import type {
  DocumentationProperty,
  DocumentationShader,
  EnumMismatch,
  ShaderExports,
  ShaderSource,
  SourceProperty,
  StaticRecord,
} from './model.js';

export const discoverShaderSources = (
  root: string,
  coreIndex: ts.SourceFile,
  reactIndex: ts.SourceFile
): ShaderSource[] =>
  shaderModulePaths(reactIndex)
    .map((modulePath) => {
      const slug = path.basename(modulePath, '.js');
      const exports = shaderExports(
        exportNamesForModule(reactIndex, modulePath),
        exportNamesForModule(coreIndex, modulePath)
      );
      return exports
        ? {
            slug,
            corePath: path.join(root, 'packages/shaders/src/shaders', `${slug}.ts`),
            reactPath: path.join(root, 'packages/shaders-react/src/shaders', `${slug}.tsx`),
            documentationPath: path.join(root, 'docs/src/shader-defs', `${slug}-def.ts`),
            exports,
          }
        : undefined;
    })
    .filter((source): source is ShaderSource => Boolean(source));

export const shaderModulePaths = (sourceFile: ts.SourceFile): string[] => [
  ...new Set(
    sourceFile.statements
      .filter(ts.isExportDeclaration)
      .map((declaration) => shaderModulePath(declaration))
      .filter((modulePath): modulePath is string => Boolean(modulePath))
  ),
];

export const sourceProperties = (
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
  interfaceName: string
): SourceProperty[] => {
  const declaration = interfaceDeclaration(sourceFile, interfaceName);
  if (!declaration) return [];

  return declaration.members
    .filter(ts.isPropertySignature)
    .map((member) => {
      const name = propertyName(member.name);
      return name && member.type
        ? {
            name,
            type: member.type.getText(sourceFile),
            required: !member.questionToken,
            options: orderedStringOptions(checker, sourceFile, member.type),
            ...(deprecatedText(member) ? { deprecated: deprecatedText(member) } : {}),
            ...(jsDocText(member) ? { description: jsDocText(member) } : {}),
          }
        : undefined;
    })
    .filter((property): property is SourceProperty => Boolean(property));
};

export const interfaceExtends = (sourceFile: ts.SourceFile, interfaceName: string, baseName: string): boolean =>
  Boolean(
    interfaceDeclaration(sourceFile, interfaceName)?.heritageClauses?.some((clause) =>
      clause.types.some((type) => type.expression.getText(sourceFile) === baseName)
    )
  );

export const defaultPresetParams = (checker: ts.TypeChecker, sourceFile: ts.SourceFile): StaticRecord => {
  const initializer = exportedVariable(sourceFile, 'defaultPreset')?.initializer;
  const preset = initializer ? staticExpressionValue(checker, initializer) : undefined;
  const params = isStaticRecord(preset) ? preset.params : undefined;
  return isStaticRecord(params) ? params : {};
};

export const bindingDefaultValues = (checker: ts.TypeChecker, sourceFile: ts.SourceFile): StaticRecord =>
  descendants(sourceFile)
    .filter(ts.isBindingElement)
    .reduce<StaticRecord>((defaults, element) => {
      const name = propertyName(element.name);
      const value = element.initializer ? staticExpressionValue(checker, element.initializer) : undefined;
      return name && value !== undefined ? { ...defaults, [name]: value } : defaults;
    }, {});

export const shaderMetadata = (checker: ts.TypeChecker, sourceFile: ts.SourceFile): StaticRecord => {
  const declaration = sourceFile.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations])
    .find((item) => propertyName(item.name)?.endsWith('Meta'));
  const value = declaration?.initializer ? staticExpressionValue(checker, declaration.initializer) : undefined;
  return isStaticRecord(value) ? value : {};
};

export const parseDocumentationShader = (sourceFile: ts.SourceFile): DocumentationShader | undefined => {
  const declaration = sourceFile.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations])
    .find((item) => propertyName(item.name)?.endsWith('Def'));
  const object = declaration?.initializer ? unwrapExpression(declaration.initializer) : undefined;
  if (!object || !ts.isObjectLiteralExpression(object)) return undefined;

  const name = staticPropertyValue(object, 'name');
  const description = staticPropertyValue(object, 'description');
  const params = objectProperty(object, 'params')?.initializer;
  if (typeof name !== 'string' || typeof description !== 'string' || !params || !ts.isArrayLiteralExpression(params)) {
    return undefined;
  }

  return {
    name,
    description,
    properties: params.elements
      .filter(ts.isObjectLiteralExpression)
      .map(parseDocumentationProperty)
      .filter((property): property is DocumentationProperty => Boolean(property)),
  };
};

export const parseCommonDocumentationProperties = (sourceFile: ts.SourceFile): DocumentationProperty[] => {
  const initializer = exportedVariable(sourceFile, 'commonParams')?.initializer;
  const object = initializer ? unwrapExpression(initializer) : undefined;
  if (!object || !ts.isObjectLiteralExpression(object)) return [];
  return object.properties
    .filter(ts.isPropertyAssignment)
    .map((property) => unwrapExpression(property.initializer))
    .filter(ts.isObjectLiteralExpression)
    .map(parseDocumentationProperty)
    .filter((property): property is DocumentationProperty => Boolean(property));
};

export const callsIdentifier = (sourceFile: ts.SourceFile, identifier: string): boolean =>
  descendants(sourceFile)
    .filter(ts.isCallExpression)
    .some((call) => ts.isIdentifier(call.expression) && call.expression.text === identifier);

export const calledIdentifierStartingWith = (sourceFile: ts.SourceFile, prefix: string): string | undefined =>
  descendants(sourceFile)
    .filter(ts.isCallExpression)
    .map((call) => call.expression)
    .filter(ts.isIdentifier)
    .map((identifier) => identifier.text)
    .find((name) => name.startsWith(prefix));

export const jsxArrayAttributeIncludes = (
  sourceFile: ts.SourceFile,
  attributeName: string,
  expectedValue: string
): boolean =>
  descendants(sourceFile)
    .filter(ts.isJsxAttribute)
    .filter((attribute) => attribute.name.getText(sourceFile) === attributeName)
    .map((attribute) => attribute.initializer)
    .filter((initializer): initializer is ts.JsxExpression => Boolean(initializer && ts.isJsxExpression(initializer)))
    .map((expression) => expression.expression)
    .filter((expression): expression is ts.ArrayLiteralExpression =>
      Boolean(expression && ts.isArrayLiteralExpression(expression))
    )
    .some((array) =>
      array.elements.some((element) => ts.isStringLiteralLike(element) && element.text === expectedValue)
    );

export const bindingDefaultExpression = (sourceFile: ts.SourceFile, bindingName: string): string | undefined =>
  descendants(sourceFile)
    .filter(ts.isBindingElement)
    .find((element) => propertyName(element.name) === bindingName)
    ?.initializer?.getText(sourceFile);

export const uniformPropertyNames = (
  sourceFile: ts.SourceFile,
  propertyNames: readonly string[]
): Record<string, string> => {
  const names = new Set(propertyNames);
  const declaration = descendants(sourceFile)
    .filter(ts.isVariableDeclaration)
    .find((candidate) => propertyName(candidate.name) === 'uniforms');
  const initializer = declaration?.initializer ? unwrapExpression(declaration.initializer) : undefined;
  if (!initializer || !ts.isObjectLiteralExpression(initializer)) return {};

  return initializer.properties.filter(ts.isPropertyAssignment).reduce<Record<string, string>>((result, property) => {
    const uniform = propertyName(property.name);
    const sourceProperty = referencedIdentifier(property.initializer, names);
    return uniform?.startsWith('u_') && sourceProperty && !(sourceProperty in result)
      ? { ...result, [sourceProperty]: uniform.slice(2) }
      : result;
  }, {});
};

export const enumMismatches = (
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
  properties: SourceProperty[],
  documentation: DocumentationShader
): EnumMismatch[] =>
  properties.flatMap((property) => {
    const documented = documentation.properties.find((candidate) => candidate.name === property.name);
    const differs =
      documented &&
      documented.options.length > 0 &&
      property.options.length > 0 &&
      (documented.options.some((option) => !property.options.includes(option)) ||
        property.options.some((option) => !documented.options.includes(option)));
    return differs
      ? [
          {
            prop: property.name,
            sourceOptions: property.options.filter((option) => !documented.options.includes(option)),
            documentationOptions: documented.options.filter((option) => !property.options.includes(option)),
            mapping: enumMappingName(sourceFile, checker, property.type),
          },
        ]
      : [];
  });

const shaderModulePath = (declaration: ts.ExportDeclaration): string | undefined => {
  const modulePath = declaration.moduleSpecifier;
  return modulePath && ts.isStringLiteral(modulePath) && modulePath.text.startsWith('./shaders/')
    ? modulePath.text
    : undefined;
};

const exportNamesForModule = (sourceFile: ts.SourceFile, modulePath: string): string[] =>
  sourceFile.statements
    .filter(ts.isExportDeclaration)
    .filter(
      (declaration) =>
        declaration.moduleSpecifier &&
        ts.isStringLiteral(declaration.moduleSpecifier) &&
        declaration.moduleSpecifier.text === modulePath
    )
    .flatMap(namedExports);

const shaderExports = (reactNames: string[], coreNames: string[]): ShaderExports | undefined => {
  const component = reactNames.find((name) => /^[A-Z]/.test(name));
  const preset = reactNames.find((name) => name.endsWith('Presets'));
  const paramsType = coreNames.find((name) => name.endsWith('Params'));
  const fragmentShader = coreNames.find((name) => name.endsWith('FragmentShader'));
  return component && preset && paramsType && fragmentShader
    ? { component, preset, paramsType, fragmentShader }
    : undefined;
};

const namedExports = (declaration: ts.ExportDeclaration): string[] =>
  declaration?.exportClause && ts.isNamedExports(declaration.exportClause)
    ? declaration.exportClause.elements.map((element) => element.name.text)
    : [];

const stringLiteralOptions = (type: ts.Type): string[] =>
  type.isUnion()
    ? type.types.filter((item): item is ts.StringLiteralType => item.isStringLiteral()).map((item) => item.value)
    : type.isStringLiteral()
      ? [type.value]
      : [];

const orderedStringOptions = (checker: ts.TypeChecker, sourceFile: ts.SourceFile, typeNode: ts.TypeNode): string[] => {
  const mapping = mappingNameForType(sourceFile, typeNode.getText(sourceFile));
  const initializer = mapping ? exportedVariable(sourceFile, mapping)?.initializer : undefined;
  const object = initializer ? unwrapExpression(initializer) : undefined;
  return object && ts.isObjectLiteralExpression(object)
    ? object.properties
        .map((property) => ('name' in property ? propertyName(property.name) : undefined))
        .filter((name): name is string => Boolean(name))
    : stringLiteralOptions(checker.getTypeAtLocation(typeNode));
};

const deprecatedText = (member: ts.PropertySignature): string | undefined =>
  ts
    .getJSDocTags(member)
    .filter((tag) => tag.tagName.text === 'deprecated')
    .map((tag) => (typeof tag.comment === 'string' ? tag.comment : tag.comment?.map((part) => part.text).join('')))
    .find((comment): comment is string => Boolean(comment));

const jsDocText = (member: ts.PropertySignature): string | undefined =>
  ts
    .getJSDocCommentsAndTags(member)
    .filter(ts.isJSDoc)
    .map((doc) => (typeof doc.comment === 'string' ? doc.comment : doc.comment?.map((part) => part.text).join('')))
    .find((comment): comment is string => Boolean(comment));

const parseDocumentationProperty = (object: ts.ObjectLiteralExpression): DocumentationProperty | undefined => {
  const name = staticPropertyValue(object, 'name');
  const description = staticPropertyValue(object, 'description');
  if (typeof name !== 'string' || typeof description !== 'string') return undefined;
  const min = staticPropertyValue(object, 'min');
  const max = staticPropertyValue(object, 'max');
  const step = staticPropertyValue(object, 'step');
  const options = staticPropertyValue(object, 'options');
  return {
    name,
    description,
    ...(typeof min === 'number' ? { min } : {}),
    ...(typeof max === 'number' ? { max } : {}),
    ...(typeof step === 'number' ? { step } : {}),
    options: Array.isArray(options) ? options.filter((option): option is string => typeof option === 'string') : [],
  };
};

const staticPropertyValue = (object: ts.ObjectLiteralExpression, name: string) => {
  const expression = objectProperty(object, name)?.initializer;
  return expression ? sourceStaticValue(expression) : undefined;
};

const descendants = (root: ts.Node): ts.Node[] => {
  const children: ts.Node[] = [];
  root.forEachChild((child) => {
    children.push(child, ...descendants(child));
  });
  return children;
};

const referencedIdentifier = (expression: ts.Expression, names: ReadonlySet<string>): string | undefined => {
  const identifier = unwrapExpression(expression);
  return ts.isIdentifier(identifier) && names.has(identifier.text) ? identifier.text : undefined;
};

const enumMappingName = (sourceFile: ts.SourceFile, checker: ts.TypeChecker, typeName: string): string | undefined => {
  const mapping = mappingNameForType(sourceFile, typeName);
  if (mapping) return mapping;
  const alias = typeAliasDeclaration(sourceFile, typeName);
  const type = alias ? checker.getTypeAtLocation(alias.type) : undefined;
  return type?.aliasSymbol?.name ?? (alias ? resolveSymbol(checker, alias.name)?.name : undefined);
};

const mappingNameForType = (sourceFile: ts.SourceFile, typeName: string): string | undefined => {
  const alias = typeAliasDeclaration(sourceFile, typeName);
  const match = alias?.type.getText(sourceFile).match(/keyof typeof (\w+)/);
  return match?.[1];
};
