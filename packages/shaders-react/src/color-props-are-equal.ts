interface PropsWithColors {
  colors?: string[];
  [key: string]: unknown;
}

function usesCssVariable(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(usesCssVariable);
  }

  return typeof value === 'string' && value.includes('var(');
}

export function colorPropsAreEqual(prevProps: PropsWithColors, nextProps: PropsWithColors): boolean {
  if (Object.keys(prevProps).length !== Object.keys(nextProps).length) {
    return false;
  }

  for (const key in prevProps) {
    // The variable's value may have changed even though the prop hasn't, so it has to be read again
    if (usesCssVariable(nextProps[key])) {
      return false;
    }

    if (key === 'colors') {
      const prevIsArray = Array.isArray(prevProps.colors);
      const nextIsArray = Array.isArray(nextProps.colors);

      if (!prevIsArray || !nextIsArray) {
        if (Object.is(prevProps.colors, nextProps.colors) === false) {
          return false;
        }

        continue;
      }

      if (prevProps.colors?.length !== nextProps.colors?.length) {
        return false;
      }

      if (!prevProps.colors?.every((color, index) => color === nextProps.colors?.[index])) {
        return false;
      }

      continue;
    }

    if (Object.is(prevProps[key], nextProps[key]) === false) {
      return false;
    }
  }

  return true;
}
