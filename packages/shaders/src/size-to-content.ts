import type { PaperShaderElement } from './shader-mount.js';

const WIDTH_VARIABLE = '--paper-shader-content-width';
const HEIGHT_VARIABLE = '--paper-shader-content-height';

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

  // The shader is observed too, so that its border changes are picked up
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const size = entry.borderBoxSize[0];
      if (entry.target === content && size) {
        contentWidth = size.inlineSize;
        contentHeight = size.blockSize;
      }
    }

    // The canvas sits inside the shader's border
    const style = getComputedStyle(shader);
    let borderX = 0;
    let borderY = 0;
    if (style.boxSizing === 'border-box') {
      borderX = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
      borderY = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    }

    shader.style.setProperty(WIDTH_VARIABLE, `${contentWidth + borderX}px`);
    shader.style.setProperty(HEIGHT_VARIABLE, `${contentHeight + borderY}px`);

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
  };
}
