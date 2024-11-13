# Paper Shaders

### Goals:

- Give designers a visual way to use common shaders in their designs
- What you make is directly exportable as lightweight code that works in any codebase

### What it is:

- Zero-dependency HTML canvas shaders that can be installed from npm or designed in Paper
- To be used in websites to add texture as backgrounds or masked with shapes and text
- Animated (or not, your choice) and highly customizable

### Values:

- Very lightweight, maximum performance
- Visual quality
- Abstractions that are easy to play with
- Wide browser and device support

### Framework support:

- Vanilla JS (@paper-design/shaders)
- React JS (@paper-design/shaders-react)
- Vue and others: accepting community PRs

### Examples:

#### React

```jsx
import { MeshGradient } from '@paper-design/shaders-react';

<MeshGradient
  colors={['#283BFC', '#FF2828', '#ddd']}
  blur="0.6"
  frequency="0.8"
  animationSpeed="1"
  style={{ width: 500, height: 200 }} />

// these settings can be configured in code or designed in Paper
```

#### Vanilla JS

```js
import { ShaderMount, meshGradientFragmentShader } from '@paper-design/shaders';

const myCanvas = document.createElement('canvas');

const shaderParams = {
  colors: ['#283BFC', color2: '#FF2828'],
  blur: 0.6,
  frequency: 0.8,
  animationSpeed: 1
}

const meshGradient = new ShaderMount(myCanvas, meshGradientFragmentShader, shaderParams);
```

## Roadmap:

### Patterns:

- Perlin noise
- Voronoi
- Meta balls
- Wave
- Random lines
- Value
- Marble
- Mesh gradient
- Dots
- Grid

### VFX

- God rays
- Starfield
- Stripe
- Mountains
- Clouds
- Water

## Building and publishing

1. Bump the version numbers as desired manually
2. Use `bun run build` on the top level of the monorepo to build each package
3. Use `bun run publish-all` to publish all (or `bun run publish-all-test` to do a dry run). You can do this even if you just bumped one package version. The others will fail to publish and continue.
