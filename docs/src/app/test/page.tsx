import { Water, Heatmap } from '@paper-design/shaders-react';

export default function TestPage() {
  return (
    <div style={{ display: 'flex' }}>
      <Water style={{ width: 600, height: 600 }} />
      <Heatmap
        image="https://workers.paper-staging.dev/file-assets/01K44QHJ96H7WP54KYYY9VPJHJ/01K4BPJWG3CVFWG7NSR3E7Q0EE.svg"
        style={{ width: 600, height: 600 }}
      />
    </div>
  );
}
