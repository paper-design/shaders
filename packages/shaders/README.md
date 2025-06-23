# @paper-design/shaders

This is the vanilla JS of Paper Shaders. You can also find framework specific wrappers.

## Example usage:

```
import { ShaderMount, meshGradientFragmentShader, getShaderColorFromString } from '@paper-design/shaders';

const myDiv = document.createElement('div');
document.body.appendChild(myDiv);
myDiv.style.width = '600px';
myDiv.style.height = '400px';

const shaderParams = {
  u_colorsCount: 4,
  u_colors: [
    getShaderColorFromString('#5100ff'),
    getShaderColorFromString('#00ff80'),
    getShaderColorFromString('#ffcc00'),
    getShaderColorFromString('#ea00ff'),
  ],
  u_distortion: 0.8,
  u_swirl: 0.7,
  u_scale: 1, // has to be set for any shader
};

const speed = 0.25;
const meshGradient = new ShaderMount(myDiv, meshGradientFragmentShader, shaderParams, undefined, speed);
```
