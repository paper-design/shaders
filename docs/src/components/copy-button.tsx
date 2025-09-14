import clsx from 'clsx';
import { useRef, useState } from 'react';

interface CopyButtonProps extends React.ComponentProps<'button'> {
  getText: () => string;
}

export function CopyButton({ getText, className, children, ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(0);
  const copyIconRef = useRef<SVGSVGElement>(null);
  const checkIconRef = useRef<SVGSVGElement>(null);

  const handleCopy = async () => {
    try {
      const text = getText();
      await navigator.clipboard.writeText(text);

      if (!timeoutRef.current) {
        const copyIcon = copyIconRef.current;
        const checkIcon = checkIconRef.current;

        if (copyIcon && checkIcon) {
          Object.assign(copyIcon.style, {
            filter: 'blur(3px)',
            scale: 0.5,
            opacity: 0,
          });

          setTimeout(() => {
            Object.assign(checkIcon.style, {
              filter: 'none',
              scale: 1,
              opacity: 1,
            });
          }, 100);
        }

        setCopied(true);
      }

      clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = 0;
        setCopied(false);

        const copyIcon = copyIconRef.current;
        const checkIcon = checkIconRef.current;

        if (copyIcon && checkIcon) {
          Object.assign(checkIcon.style, {
            filter: 'blur(3px)',
            scale: 0.5,
            opacity: 0,
          });

          Object.assign(copyIcon.style, {
            filter: 'none',
            scale: 1,
            opacity: 1,
          });
        }
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <button
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
      type="button"
      className={clsx('group flex cursor-pointer items-center justify-center', className)}
      onClick={handleCopy}
      {...props}
    >
      <span className="relative flex size-16 items-center justify-center will-change-transform">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentcolor"
          ref={copyIconRef}
          className="absolute transition-[opacity,filter,scale] duration-300 ease-out-smooth"
        >
          <path d="M11 4V2C11 1.48232 10.6067 1.05621 10.1025 1.00488L10 1H2C1.48232 1 1.05621 1.39333 1.00488 1.89746L1 2V10C1 10.5523 1.44772 11 2 11H4V6C4 4.89543 4.89543 4 6 4H11ZM6 5C5.48232 5 5.05621 5.39333 5.00488 5.89746L5 6V14C5 14.5523 5.44772 15 6 15H14C14.5523 15 15 14.5523 15 14V6C15 5.48232 14.6067 5.05621 14.1025 5.00488L14 5H6ZM14.2041 4.01074C15.2128 4.113 16 4.96435 16 6V14L15.9893 14.2041C15.8938 15.1457 15.1457 15.8938 14.2041 15.9893L14 16H6C4.96435 16 4.113 15.2128 4.01074 14.2041L4 14V12H2C0.96435 12 0.113005 11.2128 0.0107422 10.2041L0 10V2C1.28853e-07 0.895431 0.895431 3.22128e-08 2 0H10L10.2041 0.0107422C11.2128 0.113005 12 0.964349 12 2V4H14L14.2041 4.01074Z" />
        </svg>

        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="absolute transition-[opacity,filter,scale] duration-150 ease-out-smooth"
          ref={checkIconRef}
          style={{ opacity: 0, filter: 'blur(3px)', scale: 0.5 }}
        >
          <path
            d="M2.05957 8.16504L6.55957 12.9952L13.6784 3.16504"
            stroke="currentcolor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {children}
    </button>
  );
}
