import React from 'https://esm.sh/react@18.1.0';
import { Application } from 'https://deno.land/x/oak@v10.6.0/mod.ts';
import { Visitor } from 'https://esm.sh/@swc/core@1.2.171/Visitor.js';
import { createCache } from 'https://deno.land/x/deno_cache@0.4.1/mod.ts';
import { createGraph } from 'https://deno.land/x/deno_graph@0.27.0/mod.ts';
import {
  default as wasmWeb,
  parseSync,
  printSync,
  transformSync,
} from 'https://esm.sh/@swc/wasm-web@1.2.189/wasm-web.js';
import { renderToStream } from 'https://esm.sh/react-streaming@0.2.13/server?deps=react@18,react-dom@18&dev';
import { walk } from 'https://deno.land/std@0.140.0/fs/mod.ts';

import { App } from './app/App.tsx';
import * as object from './lib/object.ts';
import { ImportVisitor } from './lib/ast/ImportVisitor.ts';
import { internalToExternalURL } from './lib/path.ts';

const cache = createCache();

await wasmWeb('https://cdn.esm.sh/@swc/wasm-web@1.2.189/wasm-web_bg.wasm');

const importMap = new TextDecoder('utf-8').decode(
  await Deno.readFile(`${Deno.cwd()}/importMap.json`),
);

const hostname = Deno.env.get('hostname') ?? 'localhost';
const port = Number(Deno.env.get('port') ?? 8000);
const app = new Application();
const appSourcePrefix = '/.x';
const vendorSourcePrefix = '/.v';

const parserOptions = {
  syntax: 'typescript',
  tsx: true,
  dynamicImport: true,
};
const compileSource = async (
  source: string,
  visitor?: Visitor,
): Promise<string> => {
  const transformResult = await transformSync(source, {
    jsc: {
      parser: parserOptions,
      target: 'es2022',
    },
  });
  const ast = await parseSync(transformResult.code, parserOptions);
  if (visitor) {
    visitor.visitProgram(ast);
  }
  const { code } = printSync(ast, { minify: true });
  return code;
};

const isPathAnURL = (path: string): boolean => {
  try {
    new URL(path);
    return true;
  } catch (error: unknown) {
    return false;
  }
};

const fetchSourceFromPath = async (path: string) => {
  if (isPathAnURL(path)) {
    return await (await fetch(path)).text();
  } else {
    return await Deno.readTextFile(path);
  }
};

// Resolve ImportMap
type ImportMap = {
  imports: Record<string, string>;
};
const parsedImportMap = JSON.parse(importMap) as ImportMap;
const resolvedImports: Record<string, string> = {};
for (const [_key, path] of Object.entries(parsedImportMap.imports)) {
  const graph = await createGraph(path, {
    kind: 'codeOnly',
    cacheInfo: cache.cacheInfo,
    load: cache.load,
  });
  const { modules } = graph.toJSON();
  for (const module of modules) {
    const { specifier, local } = module;
    resolvedImports[specifier] = String(local);
  }
}

const compiledImports = await object.asyncMap<string>(
  async (local, specifier) => {
    const path = local || specifier;
    const source = await fetchSourceFromPath(path);
    try {
      const compiled = await compileSource(
        source,
        new ImportVisitor(
          specifier,
          appSourcePrefix,
          vendorSourcePrefix,
          parsedImportMap.imports,
          resolvedImports,
        ),
      );
      return compiled;
    } catch (error: unknown) {
      console.error(`Error compiling ${specifier}. Using source.`);
      return source;
    }
  },
  resolvedImports,
);

// Compile app files.
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
  transpileFiles[path] = await compileSource(
    source,
    new ImportVisitor(
      path,
      appSourcePrefix,
      vendorSourcePrefix,
      parsedImportMap.imports,
      resolvedImports,
    ),
  );
}

// Request Logger
app.use(async (ctx, next) => {
  console.log(`<--     ${ctx.request.method} ${ctx.request.url}`);
  await next();
  console.log(
    `--> ${ctx.response.status} ${ctx.request.method} ${ctx.request.url}`,
  );
});

// Vendor Source
app.use(async (ctx, next) => {
  if (!ctx.request.url.pathname.startsWith(vendorSourcePrefix)) {
    await next();
    return;
  }

  // Find it in the import map
  const path = ctx.request.url.pathname.replace(`${vendorSourcePrefix}/`, '');
  const importMapURL = parsedImportMap.imports[path];

  // Also try the external url directly in the compiled imports
  const externalURL = internalToExternalURL(
    ctx.request.url.toString(),
    vendorSourcePrefix,
  );

  let transpileFileResult;
  if (importMapURL) {
    transpileFileResult = compiledImports[importMapURL];
  }
  if (!transpileFileResult) {
    transpileFileResult = compiledImports[externalURL];
  }
  if (!transpileFileResult) {
    await next();
    return;
  }

  ctx.response.headers.set('Content-Type', 'text/javascript;charset=UTF-8');
  ctx.response.body = transpileFileResult;
});

// App Source
app.use(async (ctx, next) => {
  if (!ctx.request.url.pathname.startsWith(appSourcePrefix)) {
    await next();
    return;
  }

  const path = ctx.request.url.pathname.replace(`${appSourcePrefix}/`, '');

  const transpileFileResult = transpileFiles[path];
  if (!transpileFileResult) {
    await next();
    return;
  }

  ctx.response.headers.set('Content-Type', 'text/javascript;charset=UTF-8');
  ctx.response.body = transpileFileResult;
});

// Static files
app.use(async (ctx, next) => {
  const path = await ctx.send({
    root: `${Deno.cwd()}/public`,
  });
  if (path) {
    return;
  }
  await next();
});

/* <script type='importmap' dangerouslySetInnerHTML={{ __html: importMap }}></script> */
// React
app.use(async (ctx) => {
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
          type='module'
          defer
          dangerouslySetInnerHTML={{
            __html:
              `import{createElement}from'${vendorSourcePrefix}/react';import{hydrateRoot}from'${vendorSourcePrefix}/react-dom/client';import{ReactStreaming}from'${vendorSourcePrefix}/react-streaming/client';import{App}from'/.x/App.tsx';hydrateRoot(document.getElementById('root'),createElement(ReactStreaming,null,createElement(App)));`,
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

console.log(`Listening on http://${hostname}:${port}`);

await app.listen({
  hostname,
  port,
});
