import type { PaperShaderElement } from './shader-mount.js';

const WIDTH_VARIABLE = '--paper-shader-content-width';
const HEIGHT_VARIABLE = '--paper-shader-content-height';
const MIN_WIDTH_VARIABLE = '--paper-shader-content-min-width';
const MAX_WIDTH_VARIABLE = '--paper-shader-content-max-width';
const MIN_HEIGHT_VARIABLE = '--paper-shader-content-min-height';
const MAX_HEIGHT_VARIABLE = '--paper-shader-content-max-height';
const LIMIT_VARIABLES = [MIN_WIDTH_VARIABLE, MAX_WIDTH_VARIABLE, MIN_HEIGHT_VARIABLE, MAX_HEIGHT_VARIABLE];

/** Axes on which the shader takes the size of its content instead of its own size styles */
export type ShaderSizeToContent = 'width' | 'height' | 'both';

/**
 * Measures the content element for a shader sized to it, since the canvas can't be sized by what's inside it.
 * The caller applies the measured size: `--paper-shader-content-width` and `--paper-shader-content-height` on the
 * shader. `data-size-to-content` on the shader puts the content element at `max-content` width or `auto` height
 */
export function observeContentSize(shader: HTMLElement, content: HTMLElement): () => void {
  let contentWidth = 0;
  let contentHeight = 0;

  // The shader is observed too, so that its border and padding changes are picked up
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const size = entry.borderBoxSize[0];
      if (entry.target === content && size) {
        contentWidth = size.inlineSize;
        contentHeight = size.blockSize;
      }
    }

    // The canvas and the content fill the shader's padding box, so the size set on the shader is the content size plus
    // the border for border-box, or minus the padding for content-box
    const style = getComputedStyle(shader);
    let extraX = 0;
    let extraY = 0;
    if (style.boxSizing === 'border-box') {
      extraX = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
      extraY = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    } else {
      extraX = -(parseFloat(style.paddingLeft) + parseFloat(style.paddingRight));
      extraY = -(parseFloat(style.paddingTop) + parseFloat(style.paddingBottom));
    }

    shader.style.setProperty(WIDTH_VARIABLE, `${Math.max(0, contentWidth + extraX)}px`);
    shader.style.setProperty(HEIGHT_VARIABLE, `${Math.max(0, contentHeight + extraY)}px`);

    // The content wraps at the shader's size limits. Only px ones: a percentage would be of the shader,
    // which takes the content size, so the content would keep shrinking
    for (const [variable, value, extra] of [
      [MIN_WIDTH_VARIABLE, style.minWidth, extraX],
      [MAX_WIDTH_VARIABLE, style.maxWidth, extraX],
      [MIN_HEIGHT_VARIABLE, style.minHeight, extraY],
      [MAX_HEIGHT_VARIABLE, style.maxHeight, extraY],
    ] as const) {
      if (value.endsWith('px')) {
        shader.style.setProperty(variable, `${Math.max(0, parseFloat(value) - extra)}px`);
      } else {
        shader.style.removeProperty(variable);
      }
    }

    // Otherwise the canvas only sees its new size next frame
    (shader as PaperShaderElement).paperShaderMount?.syncSize();
  });
  // Border box, so that the content's padding changes are picked up
  observer.observe(content, { box: 'border-box' });
  observer.observe(shader);

  return () => {
    observer.disconnect();
    shader.style.removeProperty(WIDTH_VARIABLE);
    shader.style.removeProperty(HEIGHT_VARIABLE);
    for (const variable of LIMIT_VARIABLES) {
      shader.style.removeProperty(variable);
    }
  };
}
