import { resolve, sep } from 'node:path';

const rootDirectory = resolve(import.meta.dir, '../..');
const fixturePath = resolve(import.meta.dir, 'shader-mount.html');

Bun.serve({
  hostname: '127.0.0.1',
  port: 4173,
  async fetch(request) {
    const url = new URL(request.url);
    const requestedPath =
      url.pathname === '/' ? fixturePath : resolve(rootDirectory, `.${decodeURIComponent(url.pathname)}`);

    if (requestedPath !== fixturePath && !requestedPath.startsWith(`${rootDirectory}${sep}`)) {
      return new Response('Not found', { status: 404 });
    }

    const file = Bun.file(requestedPath);
    if (!(await file.exists())) return new Response('Not found', { status: 404 });

    return new Response(file);
  },
});

console.log('Paper Shaders browser test server listening on http://127.0.0.1:4173');
