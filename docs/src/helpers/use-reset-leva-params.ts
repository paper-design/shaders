import { useEffect } from 'react';

/** Leva will try to cache values for params with the same name, so we need to explicitly reset params to defaults when a new example is mounted */
export function useResetLevaParams(params: any, setParams: any, defaults: any) {
  useEffect(() => {
    // We don't reset to defaults if there is a shader config in the URL
    if (window.location.hash) {
      return;
    }

    setParamsSafe(params, setParams, defaults);
  }, [defaults]);
}

/** Leva throws an error if you try to set an object with keys it doesn't already have, so we need to prune them off before setting */
export function setParamsSafe(params: any, setParams: any, defaults: any, setImage?: (img: HTMLImageElement) => void) {
  const newParamObject: Record<string, any> = {};

  // We need to prune off any extra keys from the defaults if there isn't a leva control for it
  // Not all shaders have leva controls for all params, like frame is often not needed
  // But leva will throw an error if we try to set a param for a control that doesn't exist
  for (const [key, value] of Object.entries(defaults)) {
    if (key in params) {
      newParamObject[key] = value;
    }
  }

  setParams(newParamObject);

  // Handle preset image if provided (image loader is separate from Leva controls)
  if (defaults.image && typeof defaults.image === 'string' && setImage) {
    const img = new Image();
    img.src = defaults.image;
    img.onload = () => {
      setImage(img);
    };
  }
}
