'use client';

import { usePathname } from 'next/navigation';
import { useLayoutEffect } from 'react';

export function SavePreviousPathname() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const storage = globalThis?.sessionStorage;

    if (storage) {
      // Set the previous path as the value of the current path.
      const prevPath = storage.getItem('currentPath');

      if (prevPath && prevPath !== pathname) {
        storage.setItem('prevPath', prevPath);
      }

      // Set the current path value by looking at the browser's location object.
      storage.setItem('currentPath', pathname);
    }
  }, [pathname]);

  return null;
}

// Get previous recorded pathname
// Use it after render as it won't be up to date yet at render time
export function getPreviousPathname() {
  return globalThis?.sessionStorage?.getItem('prevPath') || null;
}
function useLayouEffect(arg0: () => void, arg1: string[]) {
  throw new Error('Function not implemented.');
}
