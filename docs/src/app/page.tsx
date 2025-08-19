import { ShaderItems } from '@/components/shader-item';

export default function Home() {
  return (
    <div className="container mx-auto -mt-16 max-w-screen-xl px-5">
      <div className="grid grid-cols-2 gap-6 gap-x-6 gap-y-8 sm:grid-cols-3 sm:gap-16 sm:gap-x-16 md:gap-y-16 lg:grid-cols-4">
        <ShaderItems />
      </div>
    </div>
  );
}
