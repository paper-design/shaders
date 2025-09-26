export function getEmptyPixel(): HTMLImageElement | undefined {
  if (typeof window === 'undefined') {
    console.warn('Paper Shaders: can’t create an image on the server');
    return undefined;
  }

  const img = new Image();
  img.src = emptyPixel;
  return img;
}

const emptyPixel = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
