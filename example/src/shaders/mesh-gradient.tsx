import { MeshGradient } from '@paper-design/shaders-react';
import { useState, useEffect, useRef } from 'react';
import GUI from 'lil-gui';

export const MeshGradientExample = () => {
  const [uniforms, setUniforms] = useState({
    color1: '#6a5496',
    color2: '#9b8ab8',
    color3: '#f5d03b',
    color4: '#e48b97',
    speed: 0.2,
  });
  const uniformsRef = useRef(uniforms);

  useEffect(() => {
    uniformsRef.current = uniforms;
  }, [uniforms]);

  useEffect(() => {
    const gui = new GUI();

    gui.add(uniformsRef.current, 'speed', 0, 1).onChange((value) => {
      setUniforms((prev) => ({ ...prev, speed: value }));
    });

    ['color1', 'color2', 'color3', 'color4'].forEach((colorKey) => {
      gui.addColor({ [colorKey]: uniformsRef.current[colorKey] }, colorKey).onChange((value) => {
        setUniforms((prev) => ({ ...prev, [colorKey]: value }));
      });
    });

    return () => {
      gui.destroy();
    };
  }, []);

  return <MeshGradient {...uniforms} style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};
