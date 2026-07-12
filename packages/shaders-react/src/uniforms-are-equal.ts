type UniformValue = string | boolean | number | number[] | number[][] | HTMLImageElement | undefined;

function uniformValuesAreEqual(a: UniformValue, b: UniformValue): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (a === undefined || b === undefined) {
    return a === b;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (a instanceof HTMLImageElement && b instanceof HTMLImageElement) {
    return a.src === b.src && a.naturalWidth === b.naturalWidth && a.naturalHeight === b.naturalHeight;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }

    return a.every((item, index) => uniformValuesAreEqual(item as UniformValue, b[index] as UniformValue));
  }

  return false;
}

export function uniformsAreEqual(
  prevUniforms: Record<string, UniformValue>,
  nextUniforms: Record<string, UniformValue>
): boolean {
  const prevKeys = Object.keys(prevUniforms);
  const nextKeys = Object.keys(nextUniforms);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    if (!uniformValuesAreEqual(prevUniforms[key], nextUniforms[key])) {
      return false;
    }
  }

  return true;
}
