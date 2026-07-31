import { describe, expect, test } from 'bun:test';
import { descriptionAndRange, parseShaderComment } from './shader-comment.js';

describe('parseShaderComment', () => {
  test('reads the shader description and uniform documentation', () => {
    const source = `
      /**
       * Example shader description
       * split over two lines.
       *
       * Fragment shader uniforms:
       * - u_amount (float): Effect strength (0 to 1)
       * - u_mode (float): Mode (0 = first, 1 = second)
       */
      export const exampleFragmentShader = '';
    `;

    expect(parseShaderComment(source, 'exampleFragmentShader')).toEqual({
      description: 'Example shader description split over two lines.',
      properties: [
        { name: 'amount', description: 'Effect strength', min: 0, max: 1 },
        { name: 'mode', description: 'Mode (0 = first, 1 = second)' },
      ],
    });
  });
});

describe('descriptionAndRange', () => {
  test('preserves descriptive parentheses before a trailing range', () => {
    expect(descriptionAndRange('Proportional gain (enhances existing dots, -1 to 1)')).toEqual({
      description: 'Proportional gain (enhances existing dots)',
      min: -1,
      max: 1,
    });
  });
});
