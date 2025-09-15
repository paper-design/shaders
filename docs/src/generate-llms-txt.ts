import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { shaderDefs } from './shader-defs/shader-defs';

const directory = dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'https://shaders.paper.design';

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
      const options = param.options.map((opt) => (param.type === 'enum' ? `"${opt}"` : opt)).join(', ');
      paramInfo += ` [${options}]`;
    }

    if (param.isColor) {
      paramInfo += ` [CSS color]`;
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
  height={500}
  // shader-specific props here
/>
\`\`\`

For GLSL usage, import from @paper-design/shaders:

\`\`\`ts
import { shaderName } from '@paper-design/shaders'
\`\`\`
`;

  writeFileSync(join(directory, '..', 'public', 'llms.txt'), content, 'utf8');
  console.log('✅ Generated llms.txt successfully');

  writeFileSync(join(directory, '..', 'public', 'llms-full.txt'), content, 'utf8');
  console.log('✅ Generated llms-full.txt successfully');
};

generateLlmsFullTxt();
