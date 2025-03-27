interface PropsWithColors {
  colors?: string[];
  [key: string]: unknown;
}

export function colorPropsAreEqual(prevProps: PropsWithColors, nextProps: PropsWithColors): boolean {
  if ((!prevProps.colors && nextProps.colors) || (prevProps.colors && !nextProps.colors)) {
    return false;
  }

  if (prevProps.colors?.length !== nextProps.colors?.length) {
    return false;
  }

  if (!prevProps.colors?.every((color, index) => color === nextProps.colors?.[index])) {
    return false;
  }

  for (const key in prevProps) {
    if (key !== 'colors') {
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }
  }

  return true;
}
