import { HtmlInCanvasRoute } from '@/components/html-in-canvas-route';
import ShaderPage from '../page';

export default function Page() {
  return (
    <HtmlInCanvasRoute shader="halftone-cmyk">
      <ShaderPage />
    </HtmlInCanvasRoute>
  );
}
