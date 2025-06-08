'use client';

import React, { ReactNode, memo } from 'react';

type ControllersProps = {
  children: ReactNode;
};

export const Controllers = memo(({ children }: ControllersProps) => {
  return (
    <div className="fixed right-5 top-5 z-[1000] rounded bg-black/70 text-white">
      <div className="min-w-[220px] max-w-[240px] divide-y divide-white/20">
        {React.Children.map(children, (child, index) => (
          <div className="p-3" key={index}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
});

Controllers.displayName = 'Controllers';
