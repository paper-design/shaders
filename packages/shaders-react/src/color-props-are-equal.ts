interface PropsWithColors {
  colors?: string[];
}

export function colorPropsAreEqual(prevProps: PropsWithColors, nextProps: PropsWithColors): boolean {
  if (!prevProps.colors && !nextProps.colors) {
    return true;
  }

  if (!prevProps.colors || !nextProps.colors) {
    return false;
  }

  if (prevProps.colors.length !== nextProps.colors.length) {
    return false;
  }

  return prevProps.colors.every((color, index) => color === nextProps.colors?.[index]);
}
