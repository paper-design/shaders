# Paper Shaders

![mesh-gradient-shader](https://github.com/user-attachments/assets/2db6e087-764c-4c36-bee7-451b09c4c91e)

### Getting started

```
// React
npm i @paper-design/shaders-react

// vanilla
npm i @paper-design/shaders
```

### React example

```jsx
import { MeshGradient } from '@paper-design/shaders-react';

<MeshGradient
  color1="#FFC0CB" // pink
  color2="#FFFF00" // yellow
  color3="#0000FF" // blue
  color4="#800080" // purple
  speed={0.25}
  style={{ width: 500, height: 200 }}
/>;

// these settings can be configured in code or designed in Paper
```

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
- Vue and others: intent to accept community PRs in the future

### Examples:

#### React

```jsx
import { MeshGradient } from '@paper-design/shaders-react';

<MeshGradient
  color1="#FFC0CB" // pink
  color2="#FFFF00" // yellow
  color3="#0000FF" // blue
  color4="#800080" // purple
  speed={0.25}
  style={{ width: 500, height: 200 }}
/>;

// these settings can be configured in code or designed in Paper
```

#### Vanilla JS

```js
import { ShaderMount, meshGradientFragmentShader, getShaderColorFromString } from '@paper-design/shaders';

const myDiv = document.createElement('div');
document.body.appendChild(myCanvas);
myDiv.style.width = '600px';
myDiv.style.height = '400px';

const shaderParams = {
  u_color1: getShaderColorFromString('#283BFC'),
  u_color2: getShaderColorFromString('#FF2828'),
  u_color3: getShaderColorFromString('#dddddd'),
  u_color4: getShaderColorFromString('#800080'),
};

const speed = 0.25;
const meshGradient = new ShaderMount(myDiv, meshGradientFragmentShader, shaderParams, undefined, speed);
```

## Roadmap:

### Patterns:

- Perlin noise (done)
- Meta balls (done)
- Mesh gradient (done)
- Dot Grid (done)
- Voronoi
- Dither
- Vector fields
- Sine wave

### VFX

- God rays
- Stripe
- Water
- Lo-fi
- Warp
- Swirl
- Crystals

## Building and publishing

1. Bump the version numbers as desired manually
2. Use `bun run build` on the top level of the monorepo to build each package
3. Use `bun run publish-all` to publish all (or `bun run publish-all-test` to do a dry run). You can do this even if you just bumped one package version. The others will fail to publish and continue.

## License and use

Feel free to use this code in any projects, commercial or otherwise.

If you use this code or wrap the library to create another shader library or tool, we ask that you give attribution and link to Paper Shaders (it helps us continue investing in this project). Thank you!
