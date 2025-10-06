// Adapted from https://github.com/epoberezkin/fast-deep-equal

export function fastDeepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;

    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0; ) if (!fastDeepEqual(a[i], b[i])) return false;
      return true;
    }

    // Our change: compare Arrays (done above) and anonymous Objects only,
    // other objects will be compared by reference equality.
    if (a.constructor !== Object) return false;

    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(b, keys[i]!)) return false;

    for (i = length; i-- !== 0; ) {
      var key = keys[i];

      if (!fastDeepEqual(a[key!], b[key!])) return false;
    }

    return true;
  }

  // true if both NaN, false otherwise
  return a !== a && b !== b;
}
