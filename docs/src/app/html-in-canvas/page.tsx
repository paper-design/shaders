import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { CodeSection } from '@/components/shader-details';
import { compactJsxTags, getShaderElementCode } from '@/helpers/runnable-example';
import { SiteHeader } from '@/components/site-header';
import { CodeBlock, CodeFile } from './code-block';
import Example from './example';
import { SupportedShaders } from './supported-shaders';

export const metadata: Metadata = {
  title: 'HTML in Canvas • Paper',
};

const quickStart = `<Shader style={{ height: 400 }}>
  <h1>HTML in canvas</h1>
  {/* and any other content */}
</Shader>`;

const layoutPropsCode = `// For example, if the cards' styles expect them
// to be direct children of the layout
<Water
  style={{ height: 200 }}
  layoutProps={{ style: { display: 'flex', gap: 8, padding: 12 } }}
>
  <Card />
  <Card />
  <Card />
</Water>`;

const structureInput = `<Water className="hero">
  <div className="content">
    <h1>Hello</h1>
    <p>Some text</p>
  </div>
</Water>`;

const structure = `<div class="hero" data-paper-shader>  // outer div: gets className and style
  <canvas content="drawable">         // shows the effect
    <div drawable>                    // inner div: gets layoutProps, everything inside is drawn
      <div class="content">           // your wrapper, optional
        <h1>Hello</h1>                // your children, unchanged
        <p>Some text</p>
      </div>
    </div>
  </canvas>
</div>`;

const sizingCases: { title: string; text: ReactNode; code: string }[] = [
  {
    title: 'Set the size yourself',
    text: (
      <>
        Use <Code>style</Code>, <Code>className</Code>, or the <Code>width</Code> and <Code>height</Code> props. The
        shader's width fills the parent by default, like any block. With no height and no <Code>sizeToContent</Code>, the shader
        is 0px tall.
      </>
    ),
    code: `// Fixed width and height
<Water width={400} height={300}>...</Water>

// The same with style
<Water style={{ width: 400, height: 300 }}>...</Water>

// Full width of the parent, with a set height
<Water style={{ height: '100vh' }}>...</Water>`,
  },
  {
    title: 'Size from content',
    text: (
      <>
        Set <Code>sizeToContent</Code> and the shader grows and shrinks with its content. Note that width of content is
        measured without wrapping, so a long line of text can make the shader wider than its parent. Set a width to your content
        if the text should wrap.
      </>
    ),
    code: `// Height from content: the width follows your layout and text wraps as usual
<Water sizeToContent="height">
  <article>...</article>
</Water>

// Height from an image, with the same proportions as the image
<Water sizeToContent="height">
  <img src="..." crossOrigin="anonymous" style={{ display: 'block', width: '100%' }} />
</Water>

// Width from content, with a set height
<Water sizeToContent="width" style={{ height: 100 }}>
  <div style={{ width: 300 }}>...</div>
</Water>

// Width and height from content, like a button or a badge
<Water sizeToContent="both">
  <div style={{ padding: 16 }}>Hello</div>
</Water>`,
  },
  {
    title: 'Inside a flex layout',
    text: 'A shader is a regular flex item. It can take the leftover space, stretch to the height of the row, or hug its content.',
    code: `// Takes the leftover width, with its own height
<div style={{ display: 'flex' }}>
  <Water style={{ flex: 1, height: 100 }}>...</Water>
  <aside style={{ width: 200 }} />
</div>

// Takes the leftover width and stretches to the height of the row
<div style={{ display: 'flex' }}>
  <Water style={{ flex: 1 }}>...</Water>
  <aside style={{ width: 200, height: 150 }} />
</div>

// Takes its width from the content, and the neighbor takes the rest
<div style={{ display: 'flex' }}>
  <Water sizeToContent="width" style={{ height: 100 }}>...</Water>
  <aside style={{ flex: 1 }} />
</div>

// Takes the leftover width, and its height comes from the content
<div style={{ display: 'flex' }}>
  <Water sizeToContent="height" style={{ flex: 1 }}>...</Water>
</div>`,
  },
];

const recommendedFixed = `<Water style={{ height: '100vh' }}>
  <div style={{ display: 'grid', placeContent: 'center', height: '100%' }}>
    <h2>Hero</h2>
    <p>The shader fills the screen, whatever the content.</p>
  </div>
</Water>`;

const recommendedFit = `<Water sizeToContent="height">
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 32 }}>
    <h2>Card</h2>
    <p>The shader is as tall as this text.</p>
  </div>
</Water>`;

const recommendedLayoutProps = `<Water
  sizeToContent="height"
  layoutProps={{
    style: { display: 'flex', flexDirection: 'column', gap: 16, padding: 32 },
  }}
>
  <h2>Card</h2>
  <p>The shader is as tall as this text.</p>
</Water>`;

const vanillaMarkup = `<div id="shader" style="height: 400px">
  <canvas content="drawable">
    <div drawable>Hello from HTML</div>
  </canvas>
</div>`;

const vanillaScript = `import { ShaderMount, waterFragmentShader } from '@paper-design/shaders';

const shader = document.querySelector('#shader');
const content = shader.querySelector('[drawable]');

new ShaderMount(shader, waterFragmentShader, {
  u_image: content,
  // ...and the rest of the shader's uniforms
});`;

const limits: { lead: string; text: ReactNode; code?: string }[] = [
  {
    lead: 'Content from other sites needs CORS.',
    text: (
      <>
        Cross-origin images need CORS headers and <Code>crossOrigin=&quot;anonymous&quot;</Code>. Cross-origin
        iframes, <Code>url()</Code> in CSS and SVG, and tainted canvases are missing from the shader&apos;s picture.
      </>
    ),
    code: `// Shows in the shader
<img src="https://other.site/photo.jpg" crossOrigin="anonymous" />

// Missing from the shader
<img src="https://other.site/photo.jpg" />
<iframe src="https://other.site" />
<div style={{ backgroundImage: 'url(https://other.site/bg.jpg)' }} />`,
  },
  {
    lead: 'Anything private or owned by the browser is left out of the shader\'s picture:',
    text: (
      <>
        system colors and themes, spelling underlines, visited links, autofill, IME popups, and video captions and
        controls. Text has no subpixel anti-aliasing either.
      </>
    ),
  },
  {
    lead: 'A transform on the element that holds your children is ignored in the shader.',
    text: (
      <>
        Put it on a child or on the shader. Also, <Code>position: fixed</Code> elements are placed relative to the
        shader, not the screen.
      </>
    ),
    code: `// Ignored in the shader
<Water layoutProps={{ style: { transform: 'rotate(5deg)' } }}>...</Water>

// Works
<Water>
  <div style={{ transform: 'rotate(5deg)' }}>...</div>
</Water>`,
  },
  {
    lead: 'The shader moves pixels, not elements.',
    text: 'Clicks land where an element is laid out, not where the effect moved it.',
  },
];

export default function HtmlInCanvasPage() {
  const source = compactJsxTags(
    fs.readFileSync(path.join(process.cwd(), 'src/app/html-in-canvas/example.jsx'), 'utf8').trim()
  );

  return (
    <div className="mx-auto box-content max-w-1104 px-16 xs:px-24 sm:px-32 md:px-48 2xl:max-w-1472 [&>div]:max-w-none">
      <SiteHeader />
      <article className="flex w-full flex-col gap-48 pb-128 text-pretty lg:[&>*:not(.full-width)>*]:max-w-[calc(100%-332px)] 3xl:[&>*:not(.full-width)>*]:max-w-1104 [&_a:not(.no-underline)]:link [&_p]:text-current/70 [&>section]:flex [&>section]:flex-col [&>section]:gap-16">
        <header className="flex w-full flex-col gap-16 pt-20">

          <h1
            className="text-3xl font-light lowercase xs:text-4xl"
            style={{ fontFeatureSettings: '"ss01"', wordSpacing: '0.1em' }}
          >
            HTML-in-Canvas support
          </h1>
          <CodeBlock code={quickStart} />
          <p className="text-lg">
            7 Paper Shaders currently support HTML-in-Canvas. You can pass any content as children of the shader component to see the effect applied to live HTML.
          </p>
          <p>
            It is a <a href="#browser-support">Chrome-only</a> feature.
          </p>
        </header>

        <section className="full-width">
          <h2 className="text-2xl font-medium lowercase">Supported shaders</h2>
          <SupportedShaders />
        </section>

        <section className="[&>section]:mt-16 [&>section]:flex [&>section]:flex-col [&>section]:gap-16">
          <h2 className="text-2xl font-medium lowercase">How to use</h2>
          <p>
            Use the shader the same way as in "image filter" mode, but instead of passing an image as a prop, pass your HTML as the
            shader&apos;s children. The easiest way to manage the layout is to wrap your content in a single container and have the CSS layout applied to this container.
          </p>
          <CodeBlock code={recommendedFixed} />
          <p>
            By default, the shader doesn&apos;t take its size from its children, so the height of the element should be set one way or another.
            To make the shader sized by HTML content, use the <Code>sizeToContent</Code> prop. Set it to{' '}
            <Code>width</Code>, <Code>height</Code> or <Code>both</Code>. Check out {' '}
            <a href="#sizing">sizing</a> section for more details.
          </p>
          <CodeBlock code={recommendedFit} />
          <p>
            If you can&apos;t or don&apos;t want to wrap your content, you can use {' '}
            <a href="#layout-props">layoutProps</a> to hold styles and attributes:
          </p>
          <CodeBlock code={recommendedLayoutProps} />

          <h2 className="text-2xl font-medium lowercase">Shader props</h2>
          <List
            items={[
              <>
                <Code>style</Code> and <Code>className</Code> size and place the shader on your page, like on any other element
              </>,
              <>
                shader-specific props like colors, <Code>speed</Code> and every other effect setting
              </>,
              <>
                HTML-in-Canvas props:
                <div className="mt-8">
                  <List
                    items={[
                      <>
                        <Code>sizeToContent</Code>
                        {' '}lets the shader take its size from your content:{' '}
                        <Code>&quot;width&quot;</Code>, <Code>&quot;height&quot;</Code> or{' '}
                        <Code>&quot;both&quot;</Code>
                      </>,
                      <>
                        <Code>layoutProps</Code>
                        {' '}styles children within shader-container
                      </>,
                      <>
                        <Code>originX</Code> and <Code>originY</Code>
                        {' '}set the point the effect&apos;s pattern grows
                        from. It matters most when the shader resizes: the pattern stays fixed at that origin point.
                        The default is <Code>0 0</Code>, most of the HTML effects look most natural when grid (dithering pixels for example)
                        pinned to the top left corner. But if your content is centered, <Code>0.5 0.5</Code> might look better because the effect
                        pattern is centered too. Resize the <a href="/paper-texture/html-in-canvas">Paper Texture</a>{' '}
                        and <a href="/image-dithering/html-in-canvas">Image Dithering</a> demos to see the difference.
                      </>,
                    ]}
                  />
                </div>
              </>,
            ]}
          />

          <h2 className="text-2xl font-medium lowercase">example</h2>
          <p>
            Here the Lens Distortion effect is applied to a flexbox layout with buttons, editable text,
            a resizable block and an image that fits its box - all working exactly like normal HTML.
          </p>
          <Example />

          <CodeSection
            heading={<h3 className="text-2xl font-medium lowercase">Example code</h3>}
            code={getShaderElementCode(source)}
            fullCode={source}
          />

          <h2 className="text-2xl font-medium lowercase" id="sizing">sizing</h2>
          <p>
            A <Code>&lt;canvas&gt;</Code> can&apos;t automatically size from the content inside it, so HTML-in-Canvas doesn&apos;t support that on
            its own. Paper Shaders do: a shader can hug its content on one axis or both, and act as a normal flex item.
            For that you only set <Code>sizeToContent</Code> prop, which wins over <Code>style</Code> on its axis: for example, with{' '}
            <Code>sizeToContent=&quot;height&quot;</Code>, a <Code>height</Code> in <Code>style</Code> is ignored.
          </p>
          <div className="flex flex-col gap-24">
            {sizingCases.map(({ title, text, code }) => (
              <div key={title} className="flex flex-col gap-8">
                <h3 className="text-lg font-medium">{title}</h3>
                <p>{text}</p>
                <CodeBlock code={code} />
              </div>
            ))}
          </div>

          <h3 className="text-lg font-medium" id="layout-props">layoutProps</h3>
          <p>
            <Code>layoutProps</Code> is a way to pass layout styles to children without wrapping them in a container. It
            takes{' '}<Code>className</Code>, <Code>style</Code>, <Code>ref</Code> and <Code>data-*</Code> attributes.
          </p>
          <CodeBlock code={layoutPropsCode} />
        </section>

        <section>
          <h2 className="text-2xl font-medium lowercase">How it works</h2>
          <p>You write:</p>
          <CodeBlock code={structureInput} />
          <p>The shader renders:</p>
          <CodeBlock code={structure} />
          <h3 className="text-2xl font-medium lowercase">How the canvas updates</h3>
          <p>
            The browser paints your HTML, but instead of showing it the normal way, it passes it to the shader as a
            texture. The browser repaints that texture on every HTML change, including things like CSS animations. Static
            shaders redraw only on HTML change, a shader&apos;s prop change, or resize. Animated shaders redraw every
            frame and pause only when they&apos;re out of view.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-medium lowercase">Limits</h2>
          <div className="flex flex-col gap-24">
            {limits.map(({ lead, text, code }) => (
              <div key={lead} className="flex flex-col gap-8">
                <p>
                  <Lead>{lead}</Lead> {text}
                </p>
                {code && <CodeBlock code={code} />}
              </div>
            ))}
          </div>
        </section>

        <section id="browser-support" className="scroll-mt-24">
          <h2 className="text-2xl font-medium lowercase">Browser support</h2>
          <Table
            head={['Browser', 'Result']}
            rows={[
              ['Chrome 157 and newer', 'The shader draws your HTML.'],
              ['Other browsers', 'Your HTML shows as normal elements on top of the shader, without the effect.'],
            ]}
          />
          <p>
            Layout is the same in both cases, but design for the second one: text has to stay readable on the
            shader&apos;s background, and anything that only exists through the effect will be missing.
          </p>
          <p>
            With server rendering, the first HTML assumes the browser has support. In browsers without it, children stay
            hidden until the page hydrates.
          </p>
          <p>
            To check for support yourself, use <Code>isHtmlInCanvasSupported()</Code> from{' '}
            <Code>@paper-design/shaders</Code>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-medium lowercase">Without React</h2>
          <p>
            Write the structure yourself and pass the inner div as <Code>u_image</Code>. The canvas has to be a direct
            child of the shader element, and the inner div a direct child of the canvas.
          </p>
          <p>
            Unsupported browsers don&apos;t get a fallback automatically: move your content out of the canvas yourself so it still shows.
            Sizing to content doesn&apos;t happen automatically either: use <Code>observeContentSize</Code> from{' '}
            <Code>@paper-design/shaders</Code> for that.
          </p>
          <CodeFile name="index.html" code={vanillaMarkup} />
          <CodeFile name="index.js" code={vanillaScript} />
        </section>
      </article>
    </div>
  );
}


function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-8 pl-24 text-current/70">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

function Lead({ children }: { children: ReactNode }) {
  return <span className="font-medium text-foreground">{children}</span>;
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-[3px] bg-foreground/6 box-decoration-clone px-4 py-2 font-mono text-[0.9em]">
      {children}
    </code>
  );
}

function Table({ head, rows }: { head: [string, string]; rows: [ReactNode, ReactNode][] }) {
  return (
    <div className="custom-scrollbar overflow-x-auto rounded-xl bg-backplate-1 squircle:rounded-2xl">
      <table className="w-full text-base">
        <thead>
          <tr className="bg-backplate-2">
            {head.map((title) => (
              <th key={title} className="px-16 py-12 text-left align-top font-medium lowercase">
                {title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, details], index) => (
            <tr key={index} className="border-table-border not-last:border-b">
              <td className="min-w-200 px-16 py-12 align-top font-medium">{name}</td>
              <td className="w-full min-w-240 px-16 py-12 align-top text-pretty text-current/70">{details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
