/**
 * Creates an object with up to 9 properties, each named using a prefix and a number.
 *
 * @example
 * const result = createNumberedObject('foo', 3, i => `bar${i + 1}`);
 * console.log(result); // { foo1: 'bar1', foo2: 'bar2', foo3: 'bar3' }
 */
export const createNumberedObject = <Prefix extends string, Count extends 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, Value>(
  prefix: Prefix,
  count: Count,
  mapFn: (i: number) => Value
) => {
  const result = new Map<string, Value>();
  for (let i = 0; i < count; i++) result.set(`${prefix}${i + 1}`, mapFn(i));
  return Object.fromEntries(result) as Record<`${Prefix}${Range<Count>}`, Value>;
};

type Range<Count extends 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9> = Count extends 1
  ? 1
  : Count extends 2
    ? 1 | 2
    : Count extends 3
      ? 1 | 2 | 3
      : Count extends 4
        ? 1 | 2 | 3 | 4
        : Count extends 5
          ? 1 | 2 | 3 | 4 | 5
          : Count extends 6
            ? 1 | 2 | 3 | 4 | 5 | 6
            : Count extends 7
              ? 1 | 2 | 3 | 4 | 5 | 6 | 7
              : Count extends 8
                ? 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
                : Count extends 9
                  ? 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
                  : never;
