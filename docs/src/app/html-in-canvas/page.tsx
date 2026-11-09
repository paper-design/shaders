import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { CodeSection } from '@/components/shader-details';
import { compactJsxTags } from '@/helpers/runnable-example';
import { SiteHeader } from '@/components/site-header';
import { CodeBlock, CodeFile, InstallationSection } from './code-block';
import Example from './example';
import { SupportedShaders } from './supported-shaders';

export const metadata: Metadata = {
  title: 'HTML in Canvas • Paper',
};

const quickStart = `<LensDistortion style={{ height: 400 }}>
  <h1>Live HTML</h1>
  <button>clickable button</button>
</LensDistortion>`;

const structure = `<div data-paper-shader>                     <!-- the shader: your width, height, className, style -->
  <canvas content="drawable" layoutsubtree>
    <div drawable>                          <!-- the content element: your layoutProps -->
      ...your children...
    </div>
  </canvas>
</div>`;

const sizing = `{/* The shader has its own size, the content fills it */}
<Water style={{ height: 400 }}>...</Water>

{/* The shader takes its height from the content */}
<Water sizeToContent="height">...</Water>

{/* Padding and layout go on the content element */}
<Water style={{ height: 400 }} layoutProps={{ style: { padding: 32 } }}>...</Water>`;

const vanillaMarkup = `<div id="shader" style="height: 400px">
  <canvas content="drawable" layoutsubtree>
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

const works: [string, ReactNode][] = [
  ['Layout and text', 'Flexbox, grid, container units, and everything else that lays out on a normal page.'],
  ['Input', 'Clicking, typing, focus, hover and scrolling. The elements are still real elements.'],
  ['Changes', 'DOM updates, CSS transitions and animations, and state changes all reach the shader by themselves.'],
  [
    'Images',
    <>
      Same-origin images, and cross-origin ones served with CORS and loaded with{' '}
      <Code>crossOrigin=&quot;anonymous&quot;</Code>.
    </>,
  ],
  ['Same-origin iframes', 'They are drawn like any other content.'],
  ['Shaders inside shaders', 'A shader in the children is drawn into the one around it.'],
  ['Screen readers', 'The content stays in the accessibility tree, like regular DOM.'],
];

const limits: [string, ReactNode][] = [
  [
    'Clicks follow the layout, not the picture',
    'A shader can move pixels, but the element stays where it was laid out. With a strong distortion, a button can look a little away from where it is clicked.',
  ],
  [
    'Only what is inside the shader is drawn',
    <>
      Anything past the edge is cut off: shadows, tooltips, dropdowns. Elements with <Code>position: fixed</Code> stay
      inside the content element too.
    </>,
  ],
  [
    'Portals skip the shader',
    'Anything rendered elsewhere in the page, like a menu portalled to the body, shows as normal HTML without the effect.',
  ],
  [
    'Transforms on the content element',
    <>
      A <Code>transform</Code> in <Code>layoutProps</Code> isn&apos;t drawn. Put it on a child, or on the shader itself.
    </>,
  ],
  [
    'Text anti-aliasing',
    'Text is drawn with grayscale anti-aliasing, so it can look slightly different from the same text outside the shader.',
  ],
  [
    'Number of shaders on a page',
    'Each shader uses one WebGL context, and Chrome keeps about 16 at a time. Past that, the oldest ones stop rendering.',
  ],
];

const notDrawn = [
  'cross-origin images and iframes without CORS',
  'canvases tainted by cross-origin content',
  'cross-origin CSS and SVG references, like background-image or clip-path urls',
  'system colors and themes',
  'spelling and grammar underlines',
  'the visited state of links',
  'autofill previews',
  'video captions and controls',
  'IME popups',
];

export default function HtmlInCanvasPage() {
  const source = compactJsxTags(
    fs.readFileSync(path.join(process.cwd(), 'src/app/html-in-canvas/example.jsx'), 'utf8').trim()
  );

  return (
    <div className="mx-auto box-content max-w-1104 px-16 xs:px-24 sm:px-32 md:px-48 2xl:max-w-1472 [&>div]:max-w-none">
      <SiteHeader />
      <article className="flex w-full flex-col gap-48 pb-128 text-pretty [&_a:not(.no-underline)]:link [&_p]:text-current/70 [&>section]:flex [&>section]:flex-col [&>section]:gap-16 [&>section_p]:max-w-768">
        <header className="flex w-full flex-col gap-16 pt-20">
          <h1
            className="text-3xl font-light lowercase xs:text-4xl"
            style={{ fontFeatureSettings: '"ss01"', wordSpacing: '0.1em' }}
          >
            HTML in Canvas
          </h1>
          <p className="text-lg">
            7 of Paper Shaders support HTML-in-Canvas: pass any content as children of the shader component, and the
            effect is applied to live HTML.<br/> It is a <a href="#browser-support">Chrome only</a> feature
          </p>
          <CodeBlock code={quickStart} />
        </header>

        <section>
          <H2>Supported shaders</H2>
          <SupportedShaders />
        </section>

        <section>
          <H2>Basic example</H2>
          <p>Pass your HTML as children. That&apos;s the whole API: there is nothing to capture or update by hand.</p>
          <Example />
        </section>

        <InstallationSection />

        <CodeSection code={source} />

        <section>
          <H2>How it works</H2>
          <p>The shader renders this structure:</p>
          <CodeBlock code={structure} />
          <ol className="flex list-decimal flex-col gap-8 pl-24 text-current/70">
            <li>
              Your children go inside one wrapper, the content element, which goes inside the shader&apos;s canvas.
            </li>
            <li>
              The browser lays the content out and paints it as usual, but gives the picture to the shader instead of
              putting it on the screen.
            </li>
            <li>The shader uses that picture as its image, and draws the result.</li>
            <li>When the HTML changes, the browser paints it again and the shader picks up the new picture.</li>
          </ol>
        </section>

        <section>
          <H2>Sizing and props</H2>
          <p>
            By default the shader is sized like any other element, and the content element fills it. Children are sized
            to their content, so give the top one <Code>height: 100%</Code> if it should fill the shader.
          </p>
          <CodeBlock code={sizing} />
          <Table
            head={['Name', 'Description']}
            rows={[
              ['children', 'The HTML to draw.'],
              [
                'layoutProps',
                <>
                  Props for the content element: <Code>className</Code>, <Code>style</Code>, <Code>ref</Code>,{' '}
                  <Code>data-*</Code>. It&apos;s the element that gets drawn, so padding, background and layout belong
                  here, not on the shader.
                </>,
              ],
              [
                'sizeToContent',
                <>
                  <Code>&quot;width&quot;</Code>, <Code>&quot;height&quot;</Code> or <Code>&quot;both&quot;</Code>. The
                  shader takes its size from the content on those axes.
                </>,
              ],
              [
                'originX, originY',
                <>
                  Where the effect&apos;s pattern starts, from <Code>0 0</Code> at the top left. Not used by Lens
                  Distortion.
                </>,
              ],
              [
                'minPixelRatio, maxPixelCount',
                'The HTML is drawn at the resolution of the canvas, so these also decide how sharp the text is.',
              ],
            ]}
          />
          <p>
            HTML is drawn 1:1 with the shader, so <Code>fit</Code>, <Code>scale</Code>, <Code>rotation</Code>,{' '}
            <Code>offsetX</Code>, <Code>offsetY</Code>, <Code>worldWidth</Code> and <Code>worldHeight</Code> have no
            effect on it. Where the browser supports HTML in canvas, children replace the <Code>image</Code> prop.
          </p>
        </section>

        <section>
          <H2>What works</H2>
          <Table head={['Feature', 'Details']} rows={works} />
        </section>

        <section>
          <H2>Limits</H2>
          <Table head={['Limit', 'What happens']} rows={limits} />
        </section>

        <section>
          <H2>What the browser won&apos;t draw</H2>
          <p>
            The browser hands the picture of your HTML to JavaScript, so it leaves out anything private or from another
            site. These parts won&apos;t appear in the shader:
          </p>
          <ul className="flex list-disc flex-col gap-4 pl-24 text-current/70">
            {notDrawn.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
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
            Write the structure yourself and pass the content element as <Code>u_image</Code>. The canvas has to be a
            direct child of the shader element, and the content element a direct child of the canvas.
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

function H2({ children }: { children: ReactNode }) {
  return <h2 className="text-2xl font-medium lowercase">{children}</h2>;
}

function Code({ children }: { children: ReactNode }) {
  return <code className="font-mono text-[0.9em]">{children}</code>;
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
