export async function ensureHiResSvg(file: File | string): Promise<{ blob: Blob }> {
  let isSvg: boolean;
  if (typeof file === 'string') {
    isSvg = file.endsWith('.svg') || file.startsWith('data:image/svg+xml');
  } else {
    isSvg = file.type === 'image/svg+xml';
  }

  // Not SVG - return as-is
  if (!isSvg) {
    if (typeof file !== 'string') {
      return { blob: file };
    }
    const response = await fetch(file);
    return { blob: await response.blob() };
  }

  // Check existing width/height (only unitless or px values; ignore percentages, CSS units etc)
  const svgString = typeof file === 'string' ? await (await fetch(file)).text() : await file.text();
  const existingWidth = svgString.match(/<svg[^>]*\s+width\s*=\s*["']([\d.]+)(?:px)?["']/i);
  const existingHeight = svgString.match(/<svg[^>]*\s+height\s*=\s*["']([\d.]+)(?:px)?["']/i);

  // If both dimensions exist and are large enough, return as-is
  const minSvgSize = 1024;
  if (existingWidth && existingHeight) {
    const w = parseFloat(existingWidth[1]!);
    const h = parseFloat(existingHeight[1]!);
    if (Math.max(w, h) >= minSvgSize) {
      return { blob: new Blob([svgString], { type: 'image/svg+xml' }) };
    }
  }

  // Get aspect ratio from viewBox
  const viewBoxMatch = svgString.match(/viewBox\s*=\s*["']([^"']+)["']/i);
  let aspectRatio = 1;
  if (viewBoxMatch) {
    const values = viewBoxMatch[1]!
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (values.length === 4 && !values.some(isNaN)) {
      const [, , vbWidth, vbHeight] = values as [number, number, number, number];
      aspectRatio = vbWidth / vbHeight;
    }
  }

  // Calculate dimensions (at least minSvgSize on the larger side)
  const width = aspectRatio >= 1 ? minSvgSize : Math.round(minSvgSize * aspectRatio);
  const height = aspectRatio >= 1 ? Math.round(minSvgSize / aspectRatio) : minSvgSize;

  // Remove existing width/height and add new ones to the svg tag
  const modifiedSvg = svgString
    .replace(/(<svg[^>]*)\s+width\s*=\s*["'][^"']*["']/i, '$1')
    .replace(/(<svg[^>]*)\s+height\s*=\s*["'][^"']*["']/i, '$1')
    .replace(/<svg/i, `<svg width="${width}" height="${height}"`);

  return { blob: new Blob([modifiedSvg], { type: 'image/svg+xml' }) };
}
