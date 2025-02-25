'use client';

import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { ShaderMount } from '@paper-design/shaders-react';
import { useState, useEffect } from 'react';

// Just a quick hard coded test to make sure passing textures is working
// and to be an example for building out more shaders that accept textures

const fragmentShader = `#version 300 es
precision highp float;

uniform sampler2D u_texture;
uniform float u_texture_aspect_ratio;
uniform vec2 u_resolution;

out vec4 fragColor;

vec2 get_img_uv(vec2 uv, float canvas_ratio, float img_ratio) {
  vec2 img_uv = uv;
  img_uv.y = 1. - img_uv.y;
  img_uv -= .5;
  if (canvas_ratio > img_ratio) {
    img_uv.x = img_uv.x * canvas_ratio / img_ratio;
  } else {
    img_uv.y = img_uv.y * img_ratio / canvas_ratio;
  }
  float scale_factor = 1.;
  scale_factor += 2. * 1e-2;
  img_uv /= scale_factor;
  img_uv += .5;

  return img_uv;
}

float get_uv_frame(vec2 uv) {
  return step(1e-2, uv.x) * step(uv.x, 1. - 1e-2) * step(1e-2, uv.y) * step(uv.y, 1. - 1e-2);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ratio = u_resolution.x / u_resolution.y;
  
  vec2 inage_uv = get_img_uv(uv, ratio, u_texture_aspect_ratio);
  
  vec4 img = texture(u_texture, inage_uv);
  vec4 background = vec4(.2, .2, .2, 1.);
  
  float frame = get_uv_frame(inage_uv);
  
  vec4 color = mix(background, img, frame);
  fragColor = color;
}`;

const TextureTest = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = '/logo-placeholder.webp';
    img.onload = () => {
      setImage(img);
    };
  }, []);

  if (image === null) {
    return null;
  }

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>

      <h1>Texture Aspect Ratio Test</h1>
      <p>
        These examples demonstrate how the shader maintains the texture&apos;s aspect ratio regardless of container
        shape.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Square container */}
        <div>
          <h2>Square Container with URL (1:1)</h2>
          <ShaderMount
            fragmentShader={fragmentShader}
            uniforms={{ u_texture: '/logo-placeholder.webp' }}
            style={{ width: 300, height: 300, border: '1px solid #ccc' }}
          />
        </div>

        {/* Wide container */}
        <div>
          <h2>Wide Container with Image in Memory (2:1)</h2>
          <ShaderMount
            fragmentShader={fragmentShader}
            uniforms={{ u_texture: image }}
            style={{ width: 400, height: 200, border: '1px solid #ccc' }}
          />
        </div>

        {/* Tall container */}
        <div>
          <h2>Tall Container with Image in Memory (1:2)</h2>
          <ShaderMount
            fragmentShader={fragmentShader}
            uniforms={{ u_texture: image }}
            style={{ width: 200, height: 400, border: '1px solid #ccc' }}
          />
        </div>
      </div>
    </>
  );
};

export default TextureTest;
