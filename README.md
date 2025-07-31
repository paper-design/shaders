# Paper Shaders

![mesh-gradient-shader](./docs/public/images/git-readme-picture.png?v=2)

### Getting started

```
// React
npm i @paper-design/shaders-react

// vanilla
npm i @paper-design/shaders

// Please pin your dependency – we will ship breaking changes under 0.0.x versioning
```

### React example

```jsx
import {MeshGradient, DotOrbit} from '@paper-design/shaders-react';

<MeshGradient
    colors={['#5100ff', '#00ff80', '#ffcc00', '#ea00ff']}
    distortion={1}
    swirl={0.8}
    speed={0.2}
    style={{width: 200, height: 200}}
/>

<DotOrbit
    colors={['#d2822d', '#0c3b7e', '#b31a57', '#37a066']}
    colorBack={'#000000'}
    scale={0.3}
    style={{width: 200, height: 200}}
/>

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

## Release notes

[View changelog →](./CHANGELOG.md)

## Building and publishing

1. Bump the version numbers as desired manually
2. Use `bun run build` on the top level of the monorepo to build each package
3. Use `bun run publish-all` to publish all (or `bun run publish-all-test` to do a dry run). You can do this even if you just bumped one package version. The others will fail to publish and continue.

## License and use

Feel free to use this code in any projects, commercial or otherwise.

If you use this code or wrap the library to create another shader library or tool, we ask that you give attribution and link to Paper Shaders (it helps us continue investing in this project). Thank you!
