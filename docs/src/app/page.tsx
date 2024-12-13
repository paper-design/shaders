import meshGradientImg from '../../public/shaders/mesh-gradient.webp';
import simplexNoiseImg from '../../public/shaders/simplex-noise.webp';
import grainCloudsImg from '../../public/shaders/grain-clouds.webp';
import neuroNoiseImg from '../../public/shaders/neuro-noise.webp';
import dotOrbitImg from '../../public/shaders/dot-orbit.webp';
import smokeRingImg from '../../public/shaders/smoke-ring.webp';
import { ShaderThumbnail } from './shader-thumbnail';

const shaders = [
  { name: 'simplex noise', image: simplexNoiseImg },
  { name: 'grain clouds', image: grainCloudsImg },
  { name: 'mesh gradient', image: meshGradientImg },
  { name: 'neuro noise', image: neuroNoiseImg },
  { name: 'dot orbit', image: dotOrbitImg },
  { name: 'smoke ring', image: smokeRingImg },
];

export default function Home() {
  return (
    <>
      <header className="bg-[#f7f6f0] pt-10 pb-32">
        <div className="container mx-auto max-w-screen-lg">
          <div>Paper</div>
          <div className="flex flex-col gap-2 text-center max-w-64 mx-auto">
            <h1 className="text-4xl font-bold">Paper Shaders</h1>
            <p className="text-lg text-gray-600">ultra fast zero-dependency shaders for your designs</p>
          </div>
        </div>
      </header>
      <main className="-mt-12">
        <div className="container mx-auto max-w-screen-lg px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-16 gap-x-16 gap-y-8 md:gap-y-16">
            {shaders.map((shader) => (
              <ShaderThumbnail key={shader.name} name={shader.name} image={shader.image} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
