import clsx from 'clsx';
import { useRef, useState } from 'react';

interface CopyButtonProps extends React.ComponentProps<'button'> {
  text: string;
  icon?: 'copy' | 'link';
  label?: string;
}

export function CopyButton({ text, className, icon = 'copy', label, ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(0);
  const copyIconRef = useRef<SVGSVGElement>(null);
  const checkIconRef = useRef<SVGSVGElement>(null);

  const handleCopy = async () => {
    try {
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
      aria-label={copied ? 'Copied' : (label ?? 'Copy to clipboard')}
      className={clsx('group flex items-center justify-center', label ? 'gap-8' : null, className)}
      onClick={handleCopy}
      {...props}
    >
      <span className="relative flex size-16 items-center justify-center will-change-transform">
        {icon === 'link' ? (
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="currentcolor"
            ref={copyIconRef}
            className="absolute transition-[opacity,filter,scale] duration-300 ease-out-smooth"
          >
            <path d="M4.62471 4.00001L4.56402 4.00001C4.04134 3.99993 3.70687 3.99988 3.4182 4.055C2.2379 4.28039 1.29846 5.17053 1.05815 6.33035C0.999538 6.61321 0.999604 6.93998 0.999703 7.43689L0.999711 7.50001L0.999703 7.56313C0.999604 8.06004 0.999538 8.38681 1.05815 8.66967C1.29846 9.8295 2.2379 10.7196 3.4182 10.945C3.70688 11.0001 4.04135 11.0001 4.56403 11L4.62471 11H5.49971C5.77585 11 5.99971 10.7762 5.99971 10.5C5.99971 10.2239 5.77585 10 5.49971 10H4.62471C4.02084 10 3.78907 9.99777 3.60577 9.96277C2.80262 9.8094 2.19157 9.21108 2.03735 8.46678C2.00233 8.29778 1.99971 8.08251 1.99971 7.50001C1.99971 6.91752 2.00233 6.70225 2.03735 6.53324C2.19157 5.78895 2.80262 5.19062 3.60577 5.03725C3.78907 5.00225 4.02084 5.00001 4.62471 5.00001H5.49971C5.77585 5.00001 5.99971 4.77615 5.99971 4.50001C5.99971 4.22387 5.77585 4.00001 5.49971 4.00001H4.62471ZM10.3747 5.00001C10.9786 5.00001 11.2104 5.00225 11.3937 5.03725C12.1968 5.19062 12.8079 5.78895 12.9621 6.53324C12.9971 6.70225 12.9997 6.91752 12.9997 7.50001C12.9997 8.08251 12.9971 8.29778 12.9621 8.46678C12.8079 9.21108 12.1968 9.8094 11.3937 9.96277C11.2104 9.99777 10.9786 10 10.3747 10H9.49971C9.22357 10 8.99971 10.2239 8.99971 10.5C8.99971 10.7762 9.22357 11 9.49971 11H10.3747L10.4354 11C10.9581 11.0001 11.2925 11.0001 11.5812 10.945C12.7615 10.7196 13.701 9.8295 13.9413 8.66967C13.9999 8.38681 13.9998 8.06005 13.9997 7.56314L13.9997 7.50001L13.9997 7.43688C13.9998 6.93998 13.9999 6.61321 13.9413 6.33035C13.701 5.17053 12.7615 4.28039 11.5812 4.055C11.2925 3.99988 10.9581 3.99993 10.4354 4.00001L10.3747 4.00001H9.49971C9.22357 4.00001 8.99971 4.22387 8.99971 4.50001C8.99971 4.77615 9.22357 5.00001 9.49971 5.00001H10.3747ZM5.00038 7C4.72424 7 4.50038 7.22386 4.50038 7.5C4.50038 7.77614 4.72424 8 5.00038 8H10.0004C10.2765 8 10.5004 7.77614 10.5004 7.5C10.5004 7.22386 10.2765 7 10.0004 7H5.00038Z" />
          </svg>
        ) : (
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
        )}

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
      {label ? <span>{copied ? 'Copied' : label}</span> : null}
    </button>
  );
}
