import React from 'https://esm.sh/v78/react@18.1.0/es2022/react.bundle.js';
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

const importMap = JSON.stringify({
  'imports': {
    'react': 'https://esm.sh/v78/react@18.1.0/es2022/react.bundle.js',
    'react-dom':
      'https://esm.sh/v78/react-dom@18.1.0/es2022/react-dom.bundle.js',
    'react-dom/client':
      'https://esm.sh/v78/react-dom@18.1.0/es2022/client.bundle.js',
    'react-streaming/client':
      'https://esm.sh/v82/react-streaming@0.2.13/es2022/client.bundle.js',
  },
});

const app = new Application();

const parserOptions = {
  syntax: 'typescript',
  tsx: true,
  dynamicImport: true,
};

let transpileFiles: Record<string, string>;
export const getTranspileFiles = async (
  directoryPath: string,
): Promise<Record<string, string>> => {
  if (transpileFiles) {
    return transpileFiles;
  }
  const output: Record<string, string> = {};
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
    output[path] = code;
  }
  return output;
};

// Transpile
app.use(async ({ request, response }, next) => {
  if (!request.url.pathname.startsWith('/.x/')) {
    await next();
    return;
  }
  const pathname = request.url.pathname.replace('/.x/', '');
  const transpileFiles = await getTranspileFiles(`${Deno.cwd()}/app`);
  const transpileFileResult = transpileFiles[pathname];
  if (transpileFileResult) {
    response.headers.set('Content-Type', 'text/javascript;charset=UTF-8');
    response.body = transpileFileResult;
    return;
  }
  await next();
});

// Static files
app.use(async (ctx, next) => {
  const path = await ctx.send({
    root: `${Deno.cwd()}/public`,
  });
  if (!path) {
    await next();
  }
});

// React
app.use(async ({ request, response }) => {
  const ApplicationDocument = (
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
    </html>
  );
  const { readable } = await renderToStream(ApplicationDocument, {
    userAgent: request.headers.get('user-agent') || undefined,
  });
  response.headers.set('Content-Type', 'text/html');
  response.body = readable;
});

await app.listen({
  hostname: Deno.env.get('hostname') ?? 'localhost',
  port: Number(Deno.env.get('port') ?? 8000),
});
