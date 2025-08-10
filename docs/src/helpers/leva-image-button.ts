import { button } from 'leva';

export function levaImageButton(onLoad: (image: HTMLImageElement) => void) {
  return button(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const image = new Image();
          image.src = e.target?.result as string;
          image.onload = () => onLoad(image);
        };

        reader.readAsDataURL(file);
      }
    };
    input.click();
  });
}

export function levaDeleteImageButton(onLoad: (image?: HTMLImageElement) => void) {
  return button(() => {
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    img.onload = () => onLoad(img);
  });
}
