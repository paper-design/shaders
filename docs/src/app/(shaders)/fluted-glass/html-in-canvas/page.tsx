import { HtmlInCanvasRoute } from '@/components/html-in-canvas-route';
import ShaderPage from '../page';

export default function Page() {
  return (
    <HtmlInCanvasRoute shader="fluted-glass">
      <ShaderPage />
    </HtmlInCanvasRoute>
  );
}
