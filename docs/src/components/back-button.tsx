import { BackIcon } from '@/icons';
import { useRouter } from 'next/navigation';

export function BackButton({ className = '' }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        // go back if there is a history
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back();
          return;
        }

        // otherwise go to home (cmd + click)
        router.push('/');
      }}
      className={`bg-background/80 fixed top-3 left-3 z-10 aspect-square cursor-pointer rounded-full p-2 shadow-sm dark:outline dark:outline-white/10 ${className}`}
    >
      <BackIcon className="size-6" />
    </button>
  );
}
