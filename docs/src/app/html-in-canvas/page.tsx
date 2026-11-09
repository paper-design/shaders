import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { CodeSection } from '@/components/shader-details';
import { compactJsxTags, getShaderElementCode } from '@/helpers/runnable-example';
import { SiteHeader } from '@/components/site-header';
import { CodeBlock, CodeFile, InstallationSection } from './code-block';
import Example from './example';
import { LayoutPropsComparison } from './layout-props-comparison';
import { SupportedShaders } from './supported-shaders';

export const metadata: Metadata = {
  title: 'HTML in Canvas • Paper',
};

const quickStart = `<Shader style={{ height: 400 }}>
  <h1>HTML in canvas</h1>
  {/* and any other content */}
</Shader>`;

const structure = `<div data-paper-shader>                     <!-- outer div: className, style -->
  <canvas content="drawable">
    <div drawable>                          <!-- inner div: gets drawn -->
      ...your children...
    </div>
  </canvas>
</div>`;

const sizingCases: { title: string; text: ReactNode; code: string }[] = [
  {
    title: 'Set the size yourself',
    text: (
      <>
        Use <Code>style</Code>, <Code>className</Code>, or the <Code>width</Code> and <Code>height</Code> props. The
        width fills the parent by default, like any block. With no height and no <Code>sizeToContent</Code>, the shader
        is 0px tall, because a canvas doesn&apos;t make room for its children.
      </>
    ),
    code: `{/* Fixed width and height */}
<Water width={400} height={300}>...</Water>

{/* The same with style */}
<Water style={{ width: 400, height: 300 }}>...</Water>

{/* Full width of the parent, with a set height */}
<Water style={{ height: '100vh' }}>...</Water>`,
  },
  {
    title: 'Size from content',
    text: (
      <>
        Set <Code>sizeToContent</Code> and the shader grows and shrinks with its content. For width, the content is
        measured without wrapping, so a long line can make the shader wider than its parent. Set a width on your own
        root element if the text should wrap.
      </>
    ),
    code: `{/* Height from content: the width follows your layout and text wraps as usual */}
<Water sizeToContent="height">
  <article>...</article>
</Water>

{/* Height from an image, with the same proportions as the image */}
<Water sizeToContent="height">
  <img src="..." crossOrigin="anonymous" style={{ display: 'block', width: '100%' }} />
</Water>

{/* Width from content, with a set height */}
<Water sizeToContent="width" style={{ height: 100 }}>
  <div style={{ width: 300 }}>...</div>
</Water>

{/* Width and height from content, like a button or a badge */}
<Water sizeToContent="both">
  <div style={{ padding: 16 }}>Hello</div>
</Water>`,
  },
  {
    title: 'Inside a flex layout',
    text: 'A shader is a regular flex item. It can take the leftover space, stretch to the height of the row, or hug its content.',
    code: `<div style={{ display: 'flex' }}>
  {/* Takes the leftover width, with its own height */}
  <Water style={{ flex: 1, height: 100 }}>...</Water>
  <aside style={{ width: 200 }} />
</div>

<div style={{ display: 'flex' }}>
  {/* Takes the leftover width and stretches to the height of the row */}
  <Water style={{ flex: 1 }}>...</Water>
  <aside style={{ width: 200, height: 150 }} />
</div>

<div style={{ display: 'flex' }}>
  {/* Takes its width from the content, the neighbor takes the rest */}
  <Water sizeToContent="width" style={{ height: 100 }}>...</Water>
  <aside style={{ flex: 1 }} />
</div>

<div style={{ display: 'flex' }}>
  {/* Takes the leftover width, its height comes from the content */}
  <Water sizeToContent="height" style={{ flex: 1 }}>...</Water>
</div>`,
  },
];

const sizingNotes: ReactNode[] = [
  <>
    <Code>sizeToContent</Code> wins over <Code>style</Code> on its axis: with{' '}
    <Code>sizeToContent=&quot;height&quot;</Code>, a <Code>height</Code> in <Code>style</Code> is ignored.
  </>,
  <>
    <Code>maxWidth</Code> still applies, but content wider than the shader gets cut off.
  </>,
  <>
    With a fixed height, <Code>height: 100%</Code> on your root element fills the shader. With{' '}
    <Code>sizeToContent=&quot;height&quot;</Code> it has no effect, because the content decides the height.
  </>,
  'A border on the shader sits around the content, and the canvas stays inside it.',
];

const recommended = `<Water style={{ height: 400 }}>
  <div style={{ display: 'flex', height: '100%', padding: 32 }}>
    {/* your content */}
  </div>
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

const limits: ReactNode[] = [
  <>
    <Lead>Content from other sites needs CORS.</Lead> Cross-origin images are drawn only when served with CORS headers
    and loaded with <Code>crossOrigin=&quot;anonymous&quot;</Code>. Cross-origin iframes, cross-origin{' '}
    <Code>url()</Code> references in CSS and SVG (like <Code>background-image</Code> or <Code>clip-path</Code>), and
    canvases tainted by cross-origin content are not drawn.
  </>,
  <>
    <Lead>Anything private or owned by the browser is left out,</Lead> because JavaScript can read the picture of your
    HTML: system colors, themes and preferences, spelling and grammar underlines, the visited state of links, pending
    autofill values, IME popups and text styling, and video captions and controls. Text has no subpixel anti-aliasing
    either, so it can look slightly different from the same text outside the shader.
  </>,
  <>
    <Lead>The inner div is the root of what gets drawn.</Lead> It&apos;s the containing block for everything inside it,
    so <Code>position: fixed</Code> stays inside the shader. A <Code>transform</Code> on the inner div itself is not
    drawn: put it on a child or on the shader.
  </>,
  <>
    <Lead>The shader moves pixels, not elements.</Lead> Clicks land where an element is laid out, not where the shader
    moved its pixels.
  </>,
];

export default function HtmlInCanvasPage() {
  const source = compactJsxTags(
    fs.readFileSync(path.join(process.cwd(), 'src/app/html-in-canvas/example.jsx'), 'utf8').trim()
  );

  return (
    <div className="mx-auto box-content max-w-1104 px-16 xs:px-24 sm:px-32 md:px-48 2xl:max-w-1472 [&>div]:max-w-none">
      <SiteHeader />
      <article className="flex w-full flex-col gap-48 pb-128 text-pretty lg:[&_:is(:not(.relative)>pre,.relative:has(>pre))]:max-w-[calc(100%-332px)] 3xl:[&_:is(:not(.relative)>pre,.relative:has(>pre))]:max-w-1104 [&_a:not(.no-underline)]:link [&_p]:text-current/70 [&>section]:flex [&>section]:flex-col [&>section]:gap-16">
        <header className="flex w-full flex-col gap-16 pt-20">
          <h1
            className="text-3xl font-light lowercase xs:text-4xl"
            style={{ fontFeatureSettings: '"ss01"', wordSpacing: '0.1em' }}
          >
            HTML in Canvas
          </h1>
          <p className="text-lg">
            7 of Paper Shaders support HTML-in-Canvas: pass any content as children of the shader component, and the
            effect is applied to live HTML. It is a <a href="#browser-support">Chrome only</a> feature
          </p>
          <CodeBlock code={quickStart} />
        </header>

        <section>
          <H2>Supported shaders</H2>
          <SupportedShaders />
        </section>

        <InstallationSection />

        <section className="[&>section]:mt-16 [&>section]:flex [&>section]:flex-col [&>section]:gap-16">
          <H2>How to use</H2>
          <p>
            Use the shader the same way as before, but instead of passing an image as a prop, pass your HTML as the
            shader&apos;s children.
          </p>
          <p>
            It's easier to wrap your content in one element and apply the CSS layout on it.
            Styles on the shader itself don&apos;t reach your content. If the shader has a set height, add{' '}
            <Code>height: 100%</Code> so the wrapper fills it.
          </p>
          <CodeBlock code={recommended} />
          <p>
            Can&apos;t add a wrapper, or need a <Code>ref</Code> or <Code>data-*</Code> attributes on the element that
            gets drawn? Use <a href="#layout-props">layoutProps</a>.
          </p>

          <H3>Props you should know</H3>
          <List
            items={[
              <>
                <Code>style</Code> and <Code>className</Code> are for the box around the shader: its size, margin and
                where it sits in your layout.
              </>,
              <>
                <Code>sizeToContent</Code> lets the shader take its size from your content. Set it to{' '}
                <Code>&quot;width&quot;</Code>, <Code>&quot;height&quot;</Code> or <Code>&quot;both&quot;</Code>. See{' '}
                <a href="#sizing">Sizing</a>.
              </>,
              <>
                <Code>originX</Code> and <Code>originY</Code> choose where the effect&apos;s pattern starts, with{' '}
                <Code>0 0</Code> at the top left. Lens Distortion doesn&apos;t use them.
              </>,
            ]}
          />
          <p>HTML is drawn 1:1 with the shader.</p>

          <H3>Example</H3>
          <p>
            Text stays real text that you can select, search and read with a screen reader. Buttons, inputs and
            scrolling work as usual, and flexbox and grid lay everything out like on any page. When the HTML changes,
            the effect updates by itself, with nothing to capture or sync by hand.
          </p>
          <Example />

          <CodeSection
            heading={<h3 className="text-lg font-medium lowercase">Example code</h3>}
            code={getShaderElementCode(source)}
            fullCode={source}
          />

          <H3 id="sizing">Sizing</H3>
          <p>
            A canvas can&apos;t take its size from the content inside it, so HTML-in-Canvas doesn&apos;t support that on
            its own. Paper Shaders do: a shader can hug its content on one axis or both, and act as a normal flex item.
            For that you only set <Code>sizeToContent</Code>.
          </p>
          <div className="flex flex-col gap-24">
            {sizingCases.map(({ title, text, code }) => (
              <div key={title} className="flex flex-col gap-8">
                <h4 className="font-medium">{title}</h4>
                <p>{text}</p>
                <CodeBlock code={code} />
              </div>
            ))}
          </div>
          <List items={sizingNotes} />
        </section>

        <section>
          <H2>How it works</H2>
          <p>The shader renders this structure:</p>
          <CodeBlock code={structure} />
          <H3>Outer and inner div</H3>
          <List
            items={[
              <>
                <strong className="font-medium">Outer div</strong>: the box on your page, styled with{' '}
                <Code>className</Code> and <Code>style</Code>. The shader doesn&apos;t process these styles.
              </>,
              <>
                <strong className="font-medium">Inner div</strong>: holds your children and fills the outer div. It
                becomes the shader&apos;s image, so everything inside it gets drawn. Padding on the outer div
                doesn&apos;t reach your content.
              </>,
            ]}
          />
          <H3>How the canvas updates</H3>
          <p>
            The browser paints your HTML but gives the picture to the shader instead of showing it. When the HTML
            changes, the browser paints again and the shader takes the new picture. Running CSS animations mean a new
            picture every frame.
          </p>
          <List
            items={[
              <>
                <strong className="font-medium">Animated</strong> (<Code>speed</Code> above 0): the shader draws every
                frame with the latest picture, and pauses when it&apos;s out of view.
              </>,
              <>
                <strong className="font-medium">Static</strong> (<Code>speed</Code> 0): the shader only draws when the
                HTML, a prop or its size changes, so there&apos;s no frame loop while nothing is happening.
              </>,
            ]}
          />
        </section>

        <section id="layout-props" className="scroll-mt-24">
          <h2 className="text-2xl font-medium">layoutProps</h2>
          <p>
            <Code>layoutProps</Code> passes <Code>className</Code>, <Code>style</Code>, <Code>ref</Code> and{' '}
            <Code>data-*</Code> straight to the inner div. Your own wrapper is usually simpler, but this can help when:
          </p>
          <List
            items={[
              "Your children have to be direct children of the layout, for example when an editor or a CMS renders them and you can't add a wrapper.",
              <>
                You need a <Code>ref</Code> or <Code>data-*</Code> attributes on the element that gets drawn.
              </>,
              <>
                You&apos;d rather skip the extra element. The inner div already fills the shader, so it doesn&apos;t
                need <Code>height: 100%</Code>.
              </>,
            ]}
          />
          <LayoutPropsComparison />
          <p>
            With <Code>sizeToContent</Code>, the width or height you sized to content overrides the same property set
            here.
          </p>
        </section>

        <section>
          <H2>Limits</H2>
          <List items={limits} />
        </section>

        <section id="browser-support" className="scroll-mt-24">
          <H2>Browser support</H2>
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
          <H2>Without React</H2>
          <p>
            Write the structure yourself and pass the inner div as <Code>u_image</Code>. The canvas has to be a direct
            child of the shader element, and the inner div a direct child of the canvas.
          </p>
          <CodeFile name="index.html" code={vanillaMarkup} />
          <CodeFile name="index.js" code={vanillaScript} />
          <p>
            The React fallback isn&apos;t included here: in browsers without support, move the content out of the canvas
            yourself. <Code>observeContentSize</Code> is exported for sizing a shader to its content.
          </p>
        </section>
      </article>
    </div>
  );
}

function H3({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3 id={id} className="mt-16 scroll-mt-24 text-lg font-medium lowercase">
      {children}
    </h3>
  );
}

function H2({ children }: { children: ReactNode }) {
  return <h2 className="text-2xl font-medium lowercase">{children}</h2>;
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
