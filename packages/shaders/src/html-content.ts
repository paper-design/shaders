import type { PaperShaderElement } from './shader-mount.js';

const WIDTH_VARIABLE = '--paper-shader-content-width';
const HEIGHT_VARIABLE = '--paper-shader-content-height';
const MIN_WIDTH_VARIABLE = '--paper-shader-content-min-width';
const MAX_WIDTH_VARIABLE = '--paper-shader-content-max-width';
const MIN_HEIGHT_VARIABLE = '--paper-shader-content-min-height';
const MAX_HEIGHT_VARIABLE = '--paper-shader-content-max-height';
const SIZE_VARIABLES = [
  WIDTH_VARIABLE,
  HEIGHT_VARIABLE,
  MIN_WIDTH_VARIABLE,
  MAX_WIDTH_VARIABLE,
  MIN_HEIGHT_VARIABLE,
  MAX_HEIGHT_VARIABLE,
];

/** Axes on which the shader takes the size of its content instead of its own size styles */
export type ShaderSizeToContent = 'width' | 'height' | 'both';

export interface HtmlContentObserver {
  /** Syncs right away, for style changes that don't resize anything */
  update(): void;
  disconnect(): void;
}

/**
 * Keeps the content element of an HTML shader in step with the shader element.
 *
 * The content element covers the shader's padding, like the canvas, so the shader's padding is copied onto it.
 *
 * With `sizeToContent`, the content element is measured, since the canvas can't be sized by what's inside it.
 * The caller applies the measured size: `--paper-shader-content-width` and `--paper-shader-content-height` on the
 * shader. `data-size-to-content` on the shader puts the content element at `max-content` width or `auto` height
 */
export function observeHtmlContent(
  shader: HTMLElement,
  content: HTMLElement,
  sizeToContent?: ShaderSizeToContent
): HtmlContentObserver {
  let contentWidth = 0;
  let contentHeight = 0;
  let isMeasured = false;

  const update = () => {
    const style = getComputedStyle(shader);

    const padding = `${style.paddingTop} ${style.paddingRight} ${style.paddingBottom} ${style.paddingLeft}`;
    if (content.style.padding !== padding) {
      content.style.padding = padding;
    }

    if (!sizeToContent || !isMeasured) return;

    // The canvas and the content fill the shader's padding box, so the size set on the shader is the content size plus
    // the border for border-box, or minus the padding for content-box
    let extraX = 0;
    let extraY = 0;
    if (style.boxSizing === 'border-box') {
      extraX = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
      extraY = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    } else {
      extraX = -(parseFloat(style.paddingLeft) + parseFloat(style.paddingRight));
      extraY = -(parseFloat(style.paddingTop) + parseFloat(style.paddingBottom));
    }

    let hasChanged = setVariable(shader, WIDTH_VARIABLE, `${Math.max(0, contentWidth + extraX)}px`);
    hasChanged = setVariable(shader, HEIGHT_VARIABLE, `${Math.max(0, contentHeight + extraY)}px`) || hasChanged;

    // The content wraps at the shader's size limits. Only px ones: a percentage would be of the shader,
    // which takes the content size, so the content would keep shrinking
    for (const [variable, value, extra] of [
      [MIN_WIDTH_VARIABLE, style.minWidth, extraX],
      [MAX_WIDTH_VARIABLE, style.maxWidth, extraX],
      [MIN_HEIGHT_VARIABLE, style.minHeight, extraY],
      [MAX_HEIGHT_VARIABLE, style.maxHeight, extraY],
    ] as const) {
      const limit = value.endsWith('px') ? `${Math.max(0, parseFloat(value) - extra)}px` : null;
      hasChanged = setVariable(shader, variable, limit) || hasChanged;
    }

    // Otherwise the canvas only sees its new size next frame
    if (hasChanged) {
      (shader as PaperShaderElement).paperShaderMount?.syncSize();
    }
  };

  // The shader is observed too, so that its border and padding changes are picked up
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const size = entry.borderBoxSize[0];
      if (entry.target === content && size) {
        contentWidth = size.inlineSize;
        contentHeight = size.blockSize;
        isMeasured = true;
      }
    }
    update();
  });
  // Border box, so that the content's padding changes are picked up
  observer.observe(content, { box: 'border-box' });
  observer.observe(shader);

  update();

  return {
    update,
    disconnect: () => {
      observer.disconnect();
      for (const variable of SIZE_VARIABLES) {
        shader.style.removeProperty(variable);
      }
    },
  };
}

/** Returns whether the value changed, null removes the variable */
function setVariable(element: HTMLElement, variable: string, value: string | null): boolean {
  const current = element.style.getPropertyValue(variable);
  if (value === null) {
    if (current === '') return false;
    element.style.removeProperty(variable);
    return true;
  }
  if (current === value) return false;
  element.style.setProperty(variable, value);
  return true;
}
