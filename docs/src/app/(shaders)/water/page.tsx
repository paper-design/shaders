'use client';

import { Water, waterPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit } from '@paper-design/shaders';
import { levaImageButton, levaDeleteImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { toHsla } from '@/helpers/to-hsla';
import { ShaderContainer } from '@/components/shader-container';
import { ShaderDetails } from '@/components/shader-details';

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = waterPresets[0].params;

const WaterWithControls = () => {
  const [imageIdx, setImageIdx] = useState(-1);
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const [status, setStatus] = useState('Click to load an image');

  const imageFiles = [
    '001.webp',
    '002.webp',
    '003.webp',
    '004.webp',
    '005.webp',
    '006.webp',
    '007.webp',
    '008.webp',
    '009.webp',
    '0010.webp',
    '0011.webp',
    '0012.webp',
    '0013.webp',
    '0014.webp',
    '0015.webp',
    '0016.webp',
    '0017.webp',
    '0018.webp',
  ] as const;
  const fileName = imageIdx >= 0 ? imageFiles[imageIdx] : null;

  useEffect(() => {
    if (imageIdx >= 0) {
      const name = imageFiles[imageIdx];
      setStatus(`Displaying image: ${name}`);
      const img = new Image();
      img.src = `/images/image-filters/${name}`;
      img.onload = () => setImage(img);
    }
  }, [imageIdx]);

  const handleClick = useCallback(() => {
    setImageIdx((prev) => (prev + 1) % imageFiles.length);
  }, []);

  const setImageWithoutStatus = useCallback((img?: HTMLImageElement) => {
    setImage(img);
    setImageIdx(-1);
    setStatus(``);
  }, []);

  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      waterPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      highlightColor: { value: toHsla(defaults.highlightColor), order: 101 },
      highlights: { value: defaults.highlights, min: 0, max: 1, order: 200 },
      layering: { value: defaults.layering, min: 0, max: 1, order: 201 },
      edges: { value: defaults.edges, min: 0, max: 1, order: 202 },
      waves: { value: defaults.waves, min: 0, max: 1, order: 203 },
      caustic: { value: defaults.caustic, min: 0, max: 1, order: 204 },
      effectScale: { value: defaults.effectScale, min: 0.01, max: 7, order: 205 },
      scale: { value: defaults.scale, min: 0.1, max: 10, order: 300 },
      fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 301 },
      speed: { value: defaults.speed, min: 0, max: 3, order: 400 },
      Image: folder(
        {
          'Upload image': levaImageButton(setImageWithoutStatus),
          'Delete image': levaDeleteImageButton(setImageWithoutStatus),
        },
        { order: 0 }
      ),
      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(waterPresets, params);
  cleanUpLevaParams(params);

  return (
    <div>
      <ShaderContainer>
        <Water onClick={handleClick} {...params} image={image || undefined} />
      </ShaderContainer>
      <div onClick={handleClick} className="py-3 text-center select-none">
        Click to change sample image
      </div>
      <ShaderDetails
        name="Water"
        currentParams={params}
        description="Mimicking water surface distortion with a combination of noises. Can be applied over the texture or just be used as an animated pattern."
        props={{
          'colorBack, highlightColor': 'Background and highlight colors.',
          'highlights': 'A coloring added over the image/background, following the caustic shape.',
          'layering': 'The power of 2nd layer of caustic distortion.',
          'edges': 'Caustic distortion power on the image edges.',
          'waves': 'Additional distortion based in simplex noise, independent from caustic.',
          'caustic': 'Power of caustic distortion.',
          'effectScale': 'Pattern scale relative to the image.',
          'scale': '',
          'fit': '',
          'speed': '',
          'IMAGE': '',
        }}
      />
    </div>
  );
};

export default WaterWithControls;
