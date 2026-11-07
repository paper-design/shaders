import { HtmlInCanvasRoute } from '@/components/html-in-canvas-route';
import ShaderPage from '../page';

export default function Page() {
  return (
    <HtmlInCanvasRoute shader="paper-texture">
      <ShaderPage />
    </HtmlInCanvasRoute>
  );
}
