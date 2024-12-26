import { BackIcon } from '@/icons';

export function BackButton({ className = '' }: { className?: string }) {
  return (
    <button
      className={` ${className} fixed top-3 left-3 aspect-square rounded-full bg-white/80 hover:bg-white z-10 p-2 shadow transition-all duration-300`}
    >
      <BackIcon className="size-6" />
    </button>
  );
}
