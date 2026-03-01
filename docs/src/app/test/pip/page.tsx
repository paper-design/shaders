'use client';

import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ShaderMount } from '@paper-design/shaders';
import { MeshGradient } from '@paper-design/shaders-react';

const fragmentShader = `#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

out vec4 fragColor;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float r = 0.5 + 0.5 * sin(u_time + uv.x * 3.0);
  float g = 0.5 + 0.5 * sin(u_time * 0.7 + uv.y * 3.0);
  float b = 0.5 + 0.5 * sin(u_time * 1.3 + (uv.x + uv.y) * 2.0);
  fragColor = vec4(r, g, b, 1.0);
}`;

type TestResult = { pass: boolean; message: string } | null;

function StatusBadge({ result }: { result: TestResult }) {
  if (!result) return <p style={{ color: '#64b5f6' }}>Waiting…</p>;
  return (
    <p style={{ color: result.pass ? '#4caf50' : '#f44336' }}>
      {result.pass ? 'PASS' : 'FAIL'} – {result.message}
    </p>
  );
}

/** Wait for a canvas to appear inside an element (handles async React init) */
function waitForCanvas(el: Element, timeoutMs = 3000): Promise<Element | null> {
  const existing = el.querySelector('canvas');
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const canvas = el.querySelector('canvas');
      if (canvas) {
        observer.disconnect();
        resolve(canvas);
      }
    });
    observer.observe(el, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeoutMs);
  });
}

const sectionStyle = { border: '1px solid #444', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem' };
const boxStyle = { width: 300, height: 200, border: '2px solid #666', borderRadius: 6 };

export default function PipTestPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const reactIframeRef = useRef<HTMLIFrameElement>(null);

  const [mainResult, setMainResult] = useState<TestResult>(null);
  const [iframeResult, setIframeResult] = useState<TestResult>(null);
  const [reactIframeResult, setReactIframeResult] = useState<TestResult>(null);
  const [pipResult, setPipResult] = useState<TestResult>(null);

  // Test 1: Vanilla ShaderMount in main document
  useEffect(() => {
    const div = mainRef.current;
    if (!div) return;

    try {
      const sm = new ShaderMount(div, fragmentShader, {}, undefined, 1);
      const pass = !!div.querySelector('canvas') && !!document.querySelector('style[data-paper-shader]');
      setMainResult({
        pass,
        message: pass ? 'Canvas and style created in main document.' : 'Missing canvas or style.',
      });
      return () => sm.dispose();
    } catch (e: any) {
      setMainResult({ pass: false, message: e.message });
    }
  }, []);

  // Test 2: Vanilla ShaderMount in iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const iframeDoc = iframe.contentDocument!;
      iframeDoc.open();
      iframeDoc.write('<!DOCTYPE html><html style="height:100%"><head></head><body style="margin:0;height:100%"><div id="host" style="width:100%;height:100%"></div></body></html>');
      iframeDoc.close();

      const host = iframeDoc.getElementById('host')!;
      const sm = new ShaderMount(host, fragmentShader, {}, undefined, 1);

      const canvasInIframe = !!host.querySelector('canvas');
      const styleInIframe = !!iframeDoc.querySelector('style[data-paper-shader]');
      const mainCanvasCount = mainRef.current?.querySelectorAll('canvas').length;

      const pass = canvasInIframe && styleInIframe && mainCanvasCount === 1;
      setIframeResult({
        pass,
        message: pass
          ? 'Canvas and style created in iframe document. No stray elements in main document.'
          : `canvasInIframe=${canvasInIframe}, styleInIframe=${styleInIframe}, mainCanvasCount=${mainCanvasCount}`,
      });
      return () => sm.dispose();
    } catch (e: any) {
      setIframeResult({ pass: false, message: e.message });
    }
  }, []);

  // Test 3: React <MeshGradient> in iframe
  useEffect(() => {
    const iframe = reactIframeRef.current;
    if (!iframe) return;

    const iframeDoc = iframe.contentDocument!;
    iframeDoc.open();
    iframeDoc.write('<!DOCTYPE html><html style="height:100%"><head></head><body style="margin:0;height:100%"><div id="root" style="width:100%;height:100%"></div></body></html>');
    iframeDoc.close();

    const rootEl = iframeDoc.getElementById('root')!;
    const root = createRoot(rootEl);
    root.render(<MeshGradient speed={1} style={{ width: '100%', height: '100%' }} />);

    waitForCanvas(rootEl).then((canvas) => {
      const styleInIframe = !!iframeDoc.querySelector('style[data-paper-shader]');

      const pass = !!canvas && styleInIframe;
      setReactIframeResult({
        pass,
        message: pass
          ? 'React MeshGradient rendered canvas and style inside iframe document.'
          : `canvas=${!!canvas}, styleInIframe=${styleInIframe}`,
      });
    });

    return () => root.unmount();
  }, []);

  // Test 4: Vanilla ShaderMount in PiP window
  const openPip = async () => {
    if (!('documentPictureInPicture' in window)) {
      setPipResult({ pass: false, message: 'Document PiP API not available. Use Chrome 116+.' });
      return;
    }

    try {
      const pipWindow = await (window as any).documentPictureInPicture.requestWindow({ width: 400, height: 300 });
      const pipDoc = pipWindow.document as Document;
      pipDoc.body.style.cssText = 'margin:0;background:#1a1a1a;display:flex;align-items:center;justify-content:center;';

      const pipDiv = pipDoc.createElement('div');
      pipDiv.style.cssText = 'width:380px;height:280px;';
      pipDoc.body.appendChild(pipDiv);

      new ShaderMount(pipDiv, fragmentShader, {}, undefined, 1);

      const canvasInPip = !!pipDiv.querySelector('canvas');
      const styleInPip = !!pipDoc.querySelector('style[data-paper-shader]');
      const mainCanvasCount = document.querySelectorAll('canvas').length;

      const pass = canvasInPip && styleInPip && mainCanvasCount === 1;
      setPipResult({
        pass,
        message: pass
          ? 'Canvas and style created in PiP document. Check the PiP window for an animated gradient.'
          : `canvasInPip=${canvasInPip}, styleInPip=${styleInPip}, mainCanvasCount=${mainCanvasCount}`,
      });
    } catch (e: any) {
      setPipResult({ pass: false, message: e.message });
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', background: '#1a1a1a', color: '#e0e0e0', minHeight: '100vh' }}>
      <h1>ShaderMount – Isolated Document Test</h1>
      <p>
        Verifies that ShaderMount creates canvas and style elements in the owner document of the parent element, not
        the global <code>document</code>.
      </p>

      <section style={sectionStyle}>
        <h2>1. Vanilla ShaderMount – main document (baseline)</h2>
        <div ref={mainRef} style={boxStyle} />
        <StatusBadge result={mainResult} />
      </section>

      <section style={sectionStyle}>
        <h2>2. Vanilla ShaderMount – iframe</h2>
        <iframe ref={iframeRef} style={{ width: 320, height: 220, border: '2px solid #666', borderRadius: 6 }} />
        <StatusBadge result={iframeResult} />
      </section>

      <section style={sectionStyle}>
        <h2>3. React MeshGradient – iframe</h2>
        <iframe ref={reactIframeRef} style={{ width: 320, height: 220, border: '2px solid #666', borderRadius: 6 }} />
        <StatusBadge result={reactIframeResult} />
      </section>

      <section style={sectionStyle}>
        <h2>4. Vanilla ShaderMount – Picture-in-Picture</h2>
        <p style={{ fontSize: '0.85rem' }}>Requires Chrome 116+ with Document PiP API.</p>
        <button
          onClick={openPip}
          style={{ padding: '0.5rem 1.2rem', borderRadius: 6, border: '1px solid #666', background: '#333', color: '#e0e0e0', cursor: 'pointer' }}
        >
          Open PiP and mount shader
        </button>
        <StatusBadge result={pipResult} />
      </section>
    </div>
  );
}
