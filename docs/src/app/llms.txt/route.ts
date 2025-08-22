import { readdir, stat } from 'fs/promises';
import { join } from 'path';

const BASE_URL = 'https://shaders.paper.design';

const getShaderRoutes = async () => {
  try {
    const shadersDir = join(process.cwd(), 'src/app', '(shaders)');

    const shaderDirs = await readdir(shadersDir);
    const shaderRoutes = [];

    for (const dir of shaderDirs) {
      const dirPath = join(shadersDir, dir);
      const dirStat = await stat(dirPath);

      if (dirStat.isDirectory()) {
        try {
          await stat(join(dirPath, 'page.tsx'));

          // Skip color demo routes and layout files
          if (!dir.includes('color-demo') && dir !== 'layout.tsx') {
            shaderRoutes.push({
              path: `/${dir}`,
              name: dir.replace(/-/g, ' '),
            });
          }
        } catch {
          // No page.tsx file, skip this directory
        }
      }
    }

    return shaderRoutes.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error reading routes:', error);
    return [];
  }
};

export async function GET() {
  const shaderRoutes = await getShaderRoutes();

  const content = `# Paper Shaders Documentation

Ultra-fast zero-dependency shader library for React and GLSL

## Shader Routes

${shaderRoutes
  .map(
    (route) =>
      `- [${route.name
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')}](${BASE_URL}${route.path})`
  )
  .join('\n')}

Each shader route includes:
- The shader name and its description
- Descriptions of all the available shader parameters
- An interactive shader component with live preview
- Real-time configurable parameters via Leva controls
- Presets for quick experimentation
`;

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
