import { BackIcon } from '@/icons';
import { useRouter } from 'next/navigation';

export function BackButton({ className = '' }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`${className} bg-background/80 fixed top-3 left-3 z-10 aspect-square rounded-full p-2 shadow-sm dark:outline dark:outline-white/10`}
    >
      <BackIcon className="size-6" />
    </button>
  );
}
