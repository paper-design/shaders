import { BackIcon } from '@/icons';

export function BackButton({ className = '' }: { className?: string }) {
  return (
    <button
      className={` ${className} fixed left-3 top-3 z-10 aspect-square rounded-full bg-white/80 p-2 shadow transition-all duration-300 hover:bg-white`}
    >
      <BackIcon className="size-6" />
    </button>
  );
}
