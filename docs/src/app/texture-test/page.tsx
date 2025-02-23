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
    vec2 rawCoord = gl_FragCoord.xy;
    if (u_resolution.x == 0.0 || u_resolution.y == 0.0) {
        fragColor = vec4(1.0, 0.0, 0.0, 1.0);
        return;
    }

    vec2 st = rawCoord / u_resolution;
    if (any(isnan(st)) || any(isinf(st))) {
        fragColor = vec4(0.0, 0.0, 1.0, 1.0);
        return;
    }

    // Sample the texture using the calculated UV coordinates
    vec4 texColor = texture(u_texture, st);

    // Mix the texture color with our debug values
    fragColor = mix(
        texColor,
        vec4(
            rawCoord.x / 1000.0,
            rawCoord.y / 1000.0,
            u_resolution.x / 1000.0,
            1.0
        ),
        0.5
    );
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
