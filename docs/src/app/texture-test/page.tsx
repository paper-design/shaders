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
uniform vec2 u_resolution;

out vec4 fragColor;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;

    // Flip the y coordinate (1.0 - y) to match typical texture coordinates
    st.y = 1.0 - st.y;

    // Simply output the texture color
    fragColor = texture(u_texture, st);
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

      {/* Testing with passing URL */}
      <ShaderMount
        fragmentShader={fragmentShader}
        uniforms={{ u_texture: '/logo-placeholder.webp' }}
        style={{ width: 300, height: 300, aspectRatio: '1/1' }}
      />

      {/* Testing with passing image */}
      <ShaderMount
        fragmentShader={fragmentShader}
        uniforms={{ u_texture: image }}
        style={{ width: 300, height: 300, aspectRatio: '1/1' }}
      />
    </>
  );
};

export default TextureTest;
