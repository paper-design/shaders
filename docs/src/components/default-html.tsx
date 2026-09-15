import { useEffect, useRef, useState } from 'react';
import type { PaperShaderElement } from '@paper-design/shaders';

export interface HtmlSample {
  /** Rendered as the shader children */
  content: React.ReactNode;
  /** The same markup, shown in the code sample */
  code: string;
  /** Imports that the code sample needs besides the shader */
  imports?: string[];
  /** Code shown between the imports and the shader, like components used in the markup */
  setup?: string;
}

function HtmlContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  let label = 'Hover me';
  if (isHovered) {
    label = clickCount === 0 ? 'Click me' : `Clicked ${clickCount} ${clickCount === 1 ? 'time' : 'times'}`;
  }

  // Liquid Metal, Heatmap and Gem Smoke pre-process their image, so they re-capture the HTML only on request
  const refreshShader = () => {
    rootRef.current?.closest<PaperShaderElement>('[data-paper-shader]')?.refreshHtmlImage?.();
  };

  useEffect(refreshShader, [label]);

  useEffect(() => {
    let wasSelected = false;

    const handleSelectionChange = () => {
      const selection = document.getSelection();
      const root = rootRef.current;
      const isSelected = Boolean(root && selection && !selection.isCollapsed && selection.containsNode(root, true));

      // Refresh while the selection is inside, and once more when it leaves
      if (isSelected || wasSelected) {
        refreshShader();
      }
      wasSelected = isSelected;
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  return (
    <div
      ref={rootRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 40,
        height: '100%',
        padding: '0 8%',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 120,
          fontWeight: 700,
          lineHeight: 1,
          background: 'linear-gradient(90deg, #4052d6, #9b5de5)',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        Select this text
      </p>
      <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setClickCount((count) => count + 1)}
        style={{
          padding: '32px 64px',
          border: 0,
          borderRadius: 999,
          background: 'linear-gradient(135deg, #4052d6, #9b5de5)',
          color: '#ffffff',
          fontSize: 48,
          cursor: 'pointer',
        }}
      >
        {label}
      </button>
    </div>
  );
}

/** Big selectable text and a real button on a transparent background */
export const defaultHtml: HtmlSample = {
  content: <HtmlContent />,
  imports: ["import { useEffect, useRef, useState } from 'react';"],
  setup: `function HtmlContent() {
  const rootRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  let label = 'Hover me';
  if (isHovered) {
    label = clickCount === 0 ? 'Click me' : \`Clicked \${clickCount} \${clickCount === 1 ? 'time' : 'times'}\`;
  }

  // Liquid Metal, Heatmap and Gem Smoke pre-process their image, so they re-capture the HTML only on request
  const refreshShader = () => {
    rootRef.current?.closest('[data-paper-shader]')?.refreshHtmlImage?.();
  };

  useEffect(refreshShader, [label]);

  useEffect(() => {
    let wasSelected = false;

    const handleSelectionChange = () => {
      const selection = document.getSelection();
      const root = rootRef.current;
      const isSelected = Boolean(root && selection && !selection.isCollapsed && selection.containsNode(root, true));

      // Refresh while the selection is inside, and once more when it leaves
      if (isSelected || wasSelected) {
        refreshShader();
      }
      wasSelected = isSelected;
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  return (
    <div
      ref={rootRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 40,
        height: '100%',
        padding: '0 8%',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 120,
          fontWeight: 700,
          lineHeight: 1,
          background: 'linear-gradient(90deg, #4052d6, #9b5de5)',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        Select this text
      </p>
      <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setClickCount((count) => count + 1)}
        style={{
          padding: '32px 64px',
          border: 0,
          borderRadius: 999,
          background: 'linear-gradient(135deg, #4052d6, #9b5de5)',
          color: '#ffffff',
          fontSize: 48,
          cursor: 'pointer',
        }}
      >
        {label}
      </button>
    </div>
  );
}`,
  code: '<HtmlContent />',
};
