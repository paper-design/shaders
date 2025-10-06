import { fastDeepEqual } from './fast-deep-equal.js';

interface PropsWithColors {
  colors?: string[];
  [key: string]: unknown;
}

export function colorPropsAreEqual(prevProps: PropsWithColors, nextProps: PropsWithColors): boolean {
  for (const key in prevProps) {
    if (key === 'colors') {
      return fastDeepEqual(prevProps.colors, nextProps.colors);
    }

    if (Object.is(prevProps[key], nextProps[key]) === false) {
      return false;
    }
  }

  return true;
}
