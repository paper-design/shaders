import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { shaderDefs } from './shader-defs/shader-defs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'https://shaders.paper.design';

const getShaderRoutes = () => {
  return shaderDefs
    .map((shaderDef) => ({
      path: `/${shaderDef.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: shaderDef.name,
      description: shaderDef.description,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

const generateLlmsTxt = () => {
  const shaderRoutes = getShaderRoutes();

  const content = `# Paper Shaders Documentation

Ultra-fast zero-dependency shader library for React and GLSL

Website: ${BASE_URL}

## Shader Routes

${shaderRoutes.map((route) => `- **[${route.name}](${BASE_URL}${route.path})**: ${route.description}`).join('\n')}
`;

  writeFileSync(join(__dirname, '..', 'public', 'llms.txt'), content, 'utf8');
  console.log('✅ Generated llms.txt successfully');
};

const generateLlmsFullTxt = () => {
  const sortedShaders = [...shaderDefs].sort((a, b) => a.name.localeCompare(b.name));

  const content = `# Paper Shaders - Complete Documentation

Ultra-fast zero-dependency shader library for React and GLSL

Website: ${BASE_URL}

## Complete Shader Reference

${sortedShaders
  .map((shader) => {
    const shaderPath = `/${shader.name.toLowerCase().replace(/\s+/g, '-')}`;

    return `### ${shader.name}

**Description:** ${shader.description}

**URL:** ${BASE_URL}${shaderPath}

**Parameters:**
${shader.params
  .map((param) => {
    let paramInfo = `- **${param.name}** (${param.type}): ${param.description}`;

    if (param.min !== undefined || param.max !== undefined) {
      const range = [];
      if (param.min !== undefined) range.push(`min: ${param.min}`);
      if (param.max !== undefined) range.push(`max: ${param.max}`);
      if (param.step !== undefined) range.push(`step: ${param.step}`);
      if (range.length > 0) paramInfo += ` [${range.join(', ')}]`;
    }

    if (param.options) {
      const options = param.options.map((opt) => (typeof opt === 'string' ? opt : opt.name)).join(', ');
      paramInfo += ` Options: [${options}]`;
    }

    if (param.isColor) {
      paramInfo += ` (Color value)`;
    }

    return paramInfo;
  })
  .join('\n')}

---`;
  })
  .join('\n\n')}

## Usage Examples

Each shader can be used in React applications with the @paper-design/shaders-react package:

\`\`\`tsx
import { ShaderName } from '@paper-design/shaders-react'

<ShaderName 
  style={{ height: 500 }}
  // shader-specific props here
/>
\`\`\`

For GLSL usage, import from @paper-design/shaders:

\`\`\`ts
import { shaderName } from '@paper-design/shaders'
\`\`\`
`;

  writeFileSync(join(__dirname, '..', 'public', 'llms-full.txt'), content, 'utf8');
  console.log('✅ Generated llms-full.txt successfully');
};

generateLlmsTxt();
generateLlmsFullTxt();
