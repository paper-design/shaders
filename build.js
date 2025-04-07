import { glob } from 'glob';
import esbuild from 'esbuild';
import { execSync } from 'child_process';

async function build(packageDir) {
  const files = glob.sync(`${packageDir}/src/**/*.ts*`);
  const entryPoints = files.filter((file) => !file.includes('.test.'));
  const outDir = `${packageDir}/dist`;
  const tsconfig = `${packageDir}/tsconfig.build.json`;

  // ----- Generate type declaration files ----- //
  try {
    execSync(`tsc --emitDeclarationOnly --declaration --outDir ${outDir} --project ${tsconfig} --pretty`, {
      stdio: 'inherit',
    });
    console.log(`Built ${outDir}/index.d.ts`);
  } catch (error) {
    // Process will exit with error code due to execSync failure
    console.error('Could not build type declaration files');
    process.exit(1);
  }

  // prettier-ignore
  const banner =
`/* * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                    Paper Shaders                    *
 *       https://github.com/paper-design/shaders       *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * */
`;

  // ----- Build the package ----- //
  // esbuild configuration
  await esbuild.build({
    entryPoints: entryPoints,
    outdir: outDir,
    banner: {
      js: banner,
    },
    platform: 'browser',
    target: 'es2022',
    format: 'esm',
    treeShaking: true,
    sourcemap: true,
    minify: false,
  });

  console.log(`Built ${outDir}/index.js`);
}

build('packages/shaders');
build('packages/shaders-react');
