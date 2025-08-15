import { BackIcon } from '@/icons';
import { useRouter } from 'next/navigation';

export function BackButton({ className = '' }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`${className} fixed top-3 left-3 z-10 aspect-square rounded-full bg-white/80 p-2 shadow-sm transition-all duration-300 hover:bg-white`}
    >
      <BackIcon className="size-6" />
    </button>
  );
}
