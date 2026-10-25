import { isPaperShaderElement } from './shader-mount.js';

const WIDTH_VARIABLE = '--paper-shader-content-width';
const HEIGHT_VARIABLE = '--paper-shader-content-height';
const FIT_ATTRIBUTE = 'data-paper-shader-fit';

/** Axes on which the shader takes the size of its content instead of its own size styles */
export type ShaderSizeToContent = 'width' | 'height' | 'both';

/**
 * Sizes the shader element to the content element on the given axes, since the canvas can't be sized by what's
 * inside it. The default styles apply the measured size, so the shader must not have its own size on those axes
 */
export function observeContentSize(
  shader: HTMLElement,
  content: HTMLElement,
  sizeToContent: ShaderSizeToContent
): () => void {
  shader.setAttribute(FIT_ATTRIBUTE, sizeToContent === 'both' ? 'width height' : sizeToContent);

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
    if (isPaperShaderElement(shader)) {
      shader.paperShaderMount?.syncSize();
    }
  });
  // Border box, so that the content's padding changes are picked up
  observer.observe(content, { box: 'border-box' });
  observer.observe(shader);

  return () => {
    observer.disconnect();
    shader.removeAttribute(FIT_ATTRIBUTE);
    shader.style.removeProperty(WIDTH_VARIABLE);
    shader.style.removeProperty(HEIGHT_VARIABLE);
  };
}
