'use client';

import React, { useState, ReactNode, memo } from 'react';

type ControlGroupProps = {
  title: string;
  children: ReactNode;
  className?: string;
  defaultCollapsed?: boolean;
  spacing?: string;
};

export const ControlGroup = memo(
  ({ title, children, className, defaultCollapsed = false, spacing = 'space-y-0.5' }: ControlGroupProps) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    return (
      <div className={className}>
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mb-1 flex w-full items-center gap-1 text-xs font-medium hover:opacity-80"
          aria-expanded={!isCollapsed}
          aria-controls={`control-group-${title}`}
        >
          <svg
            className={`h-3 w-3 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span>{title}</span>
        </button>
        <div
          id={`control-group-${title}`}
          className={`overflow-hidden transition-all duration-200 ease-in-out ${
            isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
          }`}
        >
          <div className="relative ml-1.5 mt-1">
            <div className="absolute bottom-0 left-0 top-0 w-px bg-white/10" style={{ marginTop: '-0.375rem' }} />
            <div className={`ml-2.5 ${spacing} pl-1`}>{children}</div>
          </div>
        </div>
      </div>
    );
  }
);

ControlGroup.displayName = 'ControlGroup';
