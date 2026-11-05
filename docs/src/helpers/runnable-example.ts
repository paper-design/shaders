export function getRunnableExample(code: string, css: string): string {
  const source = code
    .replace(/import '\.\/example\.css';\n/, '')
    .replace('export const params', 'const params')
    .replace('export default function Example', 'function Example')
    .trimEnd();
  const escapedCss = css.replace(/[\\`]|\$\{/g, '\\$&');

  return `${source}

const css = \`
${escapedCss}
\`;

export default function App() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <Example />
    </>
  );
}
`;
}
