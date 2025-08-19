import { BackIcon } from '@/icons';

export function BackButton({ className = '' }: { className?: string }) {
  return (
    <button className={className}>
      <BackIcon className="size-6" />
    </button>
  );
}
