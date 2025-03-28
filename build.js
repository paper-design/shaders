import path from 'path';
import { Glob } from 'bun';
import esbuild from 'esbuild';
import { execSync } from 'child_process';

async function build(packageDir) {
  const input = `${packageDir}/src/index.ts`;
  const outDir = `${packageDir}/dist`;
  const tsconfig = `${packageDir}/tsconfig.json`;

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

  // ----- Build the package ----- //
  // esbuild configuration
  await esbuild.build({
    entryPoints: [input],
    outdir: outDir,
    bundle: true,
    banner: {
      js: '/***** Paper Shaders: https://github.com/paper-design/shaders *****/',
    },
    platform: 'browser',
    target: 'es2022',
    format: 'esm',
    treeShaking: true,
    sourcemap: true,
    minify: false,
    external: ['react'],
    packages: 'external', // Treat workspace dependencies as external (the publish script will replace workspace:* with the actual version)
  });

  console.log(`Built ${outDir}/index.js`);
}

build('packages/shaders');
build('packages/shaders-react');
