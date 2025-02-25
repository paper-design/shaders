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

void main() {
    // Get normalized coordinates
    vec2 st = gl_FragCoord.xy / u_resolution;

    // Calculate the aspect ratio of the canvas
    float canvasAspectRatio = u_resolution.x / u_resolution.y;

    // Adjust texture coordinates to maintain aspect ratio
    vec2 adjustedSt = st;

    // Center the texture (move origin to center)
    adjustedSt = adjustedSt * 2.0 - 1.0;

    // Scale based on aspect ratios to prevent distortion
    if (u_texture_aspect_ratio > canvasAspectRatio) {
        // Texture is wider than canvas (relative to height)
        // Scale x to fit within canvas width
        adjustedSt.x *= canvasAspectRatio / u_texture_aspect_ratio;
    } else {
        // Texture is taller than canvas (relative to width)
        // Scale y to fit within canvas height
        adjustedSt.y *= u_texture_aspect_ratio / canvasAspectRatio;
    }

    // Convert back to 0-1 range
    adjustedSt = adjustedSt * 0.5 + 0.5;

    // Flip the y coordinate to match typical texture coordinates
    adjustedSt.y = 1.0 - adjustedSt.y;

    // Check if we're outside the valid texture coordinates
    if (adjustedSt.x < 0.0 || adjustedSt.x > 1.0 || adjustedSt.y < 0.0 || adjustedSt.y > 1.0) {
        // Outside the texture bounds - show transparent or a background color
        fragColor = vec4(0.1, 0.1, 0.1, 1.0); // Dark gray background
    } else {
        // Sample the texture with our adjusted coordinates
        fragColor = texture(u_texture, adjustedSt);
    }
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
