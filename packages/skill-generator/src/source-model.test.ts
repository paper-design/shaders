import { describe, expect, test } from 'bun:test';
import ts from 'typescript';
import { uniformPropertyNames } from './source-model.js';

describe('uniformPropertyNames', () => {
  test('ignores identifiers nested inside uniform initializer expressions', () => {
    const sourceFile = ts.createSourceFile(
      'shader.tsx',
      `
        const uniforms = {
          u_isImage: Boolean(image),
          u_image: processedImage,
          u_direct: directProperty,
        };
      `,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );

    expect(uniformPropertyNames(sourceFile, ['image', 'directProperty'])).toEqual({ directProperty: 'direct' });
  });
});
