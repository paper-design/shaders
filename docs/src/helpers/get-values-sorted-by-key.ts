/**
 * Returns an array of values from an object ordered by their keys.
 *
 * @example
 * const obj = { foo2: 'dog', foo1: 'pig', foo3: 'cat' };
 * const results = getValuesFromNumberedObject(obj);
 * console.log(results); // ['pig', 'dog', 'cat']
 */
export const getValuesSortedByKey = <T extends object>(obj: T): Array<T[keyof T]> =>
  Object.entries(obj)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);
