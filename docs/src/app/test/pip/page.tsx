'use client';

import { useEffect, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ShaderMount, type PaperShaderElement } from '@paper-design/shaders';
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

const iframeHtml =
  '<!DOCTYPE html><html style="height:100%"><head></head><body style="margin:0;height:100%"><div id="host" style="width:100%;height:100%"></div></body></html>';

type TestResult = { pass: boolean; message: string } | null;

function StatusBadge({ result }: { result: TestResult }) {
  if (!result) return <p style={{ color: '#64b5f6' }}>Waiting…</p>;
  return (
    <p style={{ color: result.pass ? '#4caf50' : '#f44336' }}>
      {result.pass ? 'PASS' : 'FAIL'} – {result.message}
    </p>
  );
}

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

function writeIframeDoc(iframe: HTMLIFrameElement): Document {
  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(iframeHtml);
  doc.close();
  return doc;
}

const sectionStyle = { border: '1px solid #444', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem' };
const boxStyle = { width: 300, height: 200, border: '2px solid #666', borderRadius: 6 };
const iframeStyle = { width: 320, height: 220, border: '2px solid #666', borderRadius: 6 };
const btnStyle = { padding: '0.5rem 1.2rem', borderRadius: 6, border: '1px solid #666', background: '#333', color: '#e0e0e0', cursor: 'pointer' } as const;

export default function PipTestPage() {
  const vanillaMainRef = useRef<HTMLDivElement>(null);
  const reactMainRef = useRef<PaperShaderElement>(null);
  const vanillaIframeRef = useRef<HTMLIFrameElement>(null);
  const reactIframeRef = useRef<HTMLIFrameElement>(null);

  const [vanillaMainResult, setVanillaMainResult] = useState<TestResult>(null);
  const [reactMainResult, setReactMainResult] = useState<TestResult>(null);
  const [vanillaIframeResult, setVanillaIframeResult] = useState<TestResult>(null);
  const [reactIframeResult, setReactIframeResult] = useState<TestResult>(null);
  const [vanillaPipResult, setVanillaPipResult] = useState<TestResult>(null);
  const [reactPipResult, setReactPipResult] = useState<TestResult>(null);

  // 1. Vanilla – main document
  useEffect(() => {
    const div = vanillaMainRef.current;
    if (!div) return;
    try {
      const sm = new ShaderMount(div, fragmentShader, {}, undefined, 1);
      const pass = !!div.querySelector('canvas') && !!document.querySelector('style[data-paper-shader]');
      setVanillaMainResult({ pass, message: pass ? 'Canvas and style created in main document.' : 'Missing canvas or style.' });
      return () => sm.dispose();
    } catch (e: any) {
      setVanillaMainResult({ pass: false, message: e.message });
    }
  }, []);

  // 2. React – main document
  useEffect(() => {
    const div = reactMainRef.current;
    if (!div) return;
    waitForCanvas(div).then((canvas) => {
      const pass = !!canvas && !!document.querySelector('style[data-paper-shader]');
      setReactMainResult({ pass, message: pass ? 'Canvas and style created in main document.' : `canvas=${!!canvas}` });
    });
  }, []);

  // 3. Vanilla – iframe
  useEffect(() => {
    const iframe = vanillaIframeRef.current;
    if (!iframe) return;
    try {
      const iframeDoc = writeIframeDoc(iframe);
      const host = iframeDoc.getElementById('host')!;
      const sm = new ShaderMount(host, fragmentShader, {}, undefined, 1);

      const canvasInIframe = !!host.querySelector('canvas');
      const styleInIframe = !!iframeDoc.querySelector('style[data-paper-shader]');
      const pass = canvasInIframe && styleInIframe;
      setVanillaIframeResult({
        pass,
        message: pass
          ? 'Canvas and style created in iframe document.'
          : `canvasInIframe=${canvasInIframe}, styleInIframe=${styleInIframe}`,
      });
      return () => sm.dispose();
    } catch (e: any) {
      setVanillaIframeResult({ pass: false, message: e.message });
    }
  }, []);

  // 4. React – iframe
  useEffect(() => {
    const iframe = reactIframeRef.current;
    if (!iframe) return;

    const iframeDoc = writeIframeDoc(iframe);
    const host = iframeDoc.getElementById('host')!;
    const root = createRoot(host);
    root.render(<MeshGradient speed={1} style={{ width: '100%', height: '100%' }} />);

    waitForCanvas(host).then((canvas) => {
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

  // 5. Vanilla – PiP
  const openVanillaPip = async () => {
    if (!('documentPictureInPicture' in window)) {
      setVanillaPipResult({ pass: false, message: 'Document PiP API not available. Use Chrome 116+.' });
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
      const pass = canvasInPip && styleInPip;
      setVanillaPipResult({
        pass,
        message: pass
          ? 'Canvas and style created in PiP document. Check PiP window for animated gradient.'
          : `canvasInPip=${canvasInPip}, styleInPip=${styleInPip}`,
      });
    } catch (e: any) {
      setVanillaPipResult({ pass: false, message: e.message });
    }
  };

  // 6. React – PiP
  const pipReactRootRef = useRef<Root | null>(null);
  const openReactPip = async () => {
    if (!('documentPictureInPicture' in window)) {
      setReactPipResult({ pass: false, message: 'Document PiP API not available. Use Chrome 116+.' });
      return;
    }
    try {
      const pipWindow = await (window as any).documentPictureInPicture.requestWindow({ width: 400, height: 300 });
      const pipDoc = pipWindow.document as Document;
      pipDoc.body.style.cssText = 'margin:0;background:#1a1a1a;display:flex;align-items:center;justify-content:center;';

      const pipDiv = pipDoc.createElement('div');
      pipDiv.style.cssText = 'width:380px;height:280px;';
      pipDoc.body.appendChild(pipDiv);

      pipReactRootRef.current?.unmount();
      const root = createRoot(pipDiv);
      pipReactRootRef.current = root;
      root.render(<MeshGradient speed={1} style={{ width: '100%', height: '100%' }} />);

      waitForCanvas(pipDiv).then((canvas) => {
        const styleInPip = !!pipDoc.querySelector('style[data-paper-shader]');
        const pass = !!canvas && styleInPip;
        setReactPipResult({
          pass,
          message: pass
            ? 'React MeshGradient rendered in PiP document. Check PiP window for animated gradient.'
            : `canvas=${!!canvas}, styleInPip=${styleInPip}`,
        });
      });
    } catch (e: any) {
      setReactPipResult({ pass: false, message: e.message });
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', background: '#1a1a1a', color: '#e0e0e0', minHeight: '100vh' }}>
      <h1>ShaderMount – Isolated Document Test</h1>
      <p>
        Verifies that ShaderMount creates canvas and style elements in the owner document of the parent element, not
        the global <code>document</code>.
      </p>

      <h2 style={{ marginTop: '2rem' }}>Main document (baseline)</h2>

      <section style={sectionStyle}>
        <h3>1. Vanilla ShaderMount</h3>
        <div ref={vanillaMainRef} style={boxStyle} />
        <StatusBadge result={vanillaMainResult} />
      </section>

      <section style={sectionStyle}>
        <h3>2. React MeshGradient</h3>
        <MeshGradient ref={reactMainRef} speed={1} style={boxStyle} />
        <StatusBadge result={reactMainResult} />
      </section>

      <h2 style={{ marginTop: '2rem' }}>Iframe (isolated document)</h2>

      <section style={sectionStyle}>
        <h3>3. Vanilla ShaderMount</h3>
        <iframe ref={vanillaIframeRef} style={iframeStyle} />
        <StatusBadge result={vanillaIframeResult} />
      </section>

      <section style={sectionStyle}>
        <h3>4. React MeshGradient</h3>
        <iframe ref={reactIframeRef} style={iframeStyle} />
        <StatusBadge result={reactIframeResult} />
      </section>

      <h2 style={{ marginTop: '2rem' }}>Picture-in-Picture (Chrome 116+)</h2>

      <section style={sectionStyle}>
        <h3>5. Vanilla ShaderMount</h3>
        <button onClick={openVanillaPip} style={btnStyle}>Open PiP</button>
        <StatusBadge result={vanillaPipResult} />
      </section>

      <section style={sectionStyle}>
        <h3>6. React MeshGradient</h3>
        <button onClick={openReactPip} style={btnStyle}>Open PiP</button>
        <StatusBadge result={reactPipResult} />
      </section>
    </div>
  );
}
