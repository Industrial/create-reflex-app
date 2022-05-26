import React from 'https://esm.sh/react@18';
import { Application } from 'https://deno.land/x/oak@v10.6.0/mod.ts';
import {
  default as wasmWeb,
  parseSync,
  printSync,
  transformSync,
} from 'https://esm.sh/@swc/wasm-web@1.2.189/wasm-web.js';
import { renderToStream } from 'https://esm.sh/react-streaming/server?deps=react@18,react-dom@18&dev';
import { walk } from 'https://deno.land/std@0.140.0/fs/mod.ts';

import { App } from './app/App.tsx';

await wasmWeb('https://cdn.esm.sh/@swc/wasm-web@1.2.189/wasm-web_bg.wasm');

const importMap = new TextDecoder('utf-8').decode(
  await Deno.readFile(`${Deno.cwd()}/importMap.json`),
);

const app = new Application();

const parserOptions = {
  syntax: 'typescript',
  tsx: true,
  dynamicImport: true,
};
const directoryPath = `${Deno.cwd()}/app`;
const transpileFiles: Record<string, string> = {};
for await (
  const entry of walk(directoryPath, {
    includeDirs: false,
    followSymlinks: true,
    exts: [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
    ],
  })
) {
  const path = entry.path.replace(`${directoryPath}/`, '');
  const source = await Deno.readTextFile(entry.path);
  const transformResult = await transformSync(source, {
    jsc: {
      parser: parserOptions,
      target: 'es2022',
    },
  });
  const ast = await parseSync(transformResult.code, parserOptions);
  const { code } = printSync(ast, { minify: true });
  transpileFiles[path] = code;
}

app.use(async (ctx) => {
  // Transpile
  if (ctx.request.url.pathname.startsWith('/.x/')) {
    const transpileFileResult =
      transpileFiles[ctx.request.url.pathname.replace('/.x/', '')];
    if (transpileFileResult) {
      ctx.response.headers.set('Content-Type', 'text/javascript;charset=UTF-8');
      ctx.response.body = transpileFileResult;
      return;
    }
  }

  // Static files
  const path = await ctx.send({
    root: `${Deno.cwd()}/public`,
  });
  if (path) {
    return;
  }

  // React
  ctx.response.headers.set('Content-Type', 'text/html');
  ctx.response.body = (await renderToStream(
    <html>
      <head>
        <title>React Streaming</title>
      </head>
      <body>
        <div id='root'>
          <App />
        </div>
        <script
          type='importmap'
          dangerouslySetInnerHTML={{ __html: importMap }}
        >
        </script>
        <script
          type='module'
          defer
          dangerouslySetInnerHTML={{
            __html:
              `import{createElement}from'react';import{hydrateRoot}from'react-dom/client';import{ReactStreaming}from'react-streaming/client';import{App}from'/.x/App.tsx';hydrateRoot(document.getElementById('root'),createElement(ReactStreaming,null,createElement(App)));`,
          }}
        >
        </script>
      </body>
    </html>,
    {
      userAgent: ctx.request.headers.get('user-agent') || undefined,
    },
  )).readable;
});

await app.listen({
  hostname: Deno.env.get('hostname') ?? 'localhost',
  port: Number(Deno.env.get('port') ?? 8000),
});
