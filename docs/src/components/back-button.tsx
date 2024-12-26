import { BackIcon } from '@/icons';

export function BackButton({ className = '' }: { className?: string }) {
  return (
    <button
      className={` ${className} fixed top-3 left-3 aspect-square rounded-full bg-white/80 hover:bg-white/90 z-10 p-2`}
    >
      <BackIcon className="size-6" />
    </button>
  );
}
