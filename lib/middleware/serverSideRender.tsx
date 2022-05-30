import React from 'react';
import { Middleware } from 'https://deno.land/x/oak@v10.6.0/mod.ts';
import { renderToStream } from 'https://esm.sh/react-streaming@0.2.13/server?deps=react@18,react-dom@18&dev';

import { App } from '../../app/App.tsx';

export type ServerSideRender = {
  vendorSourcePrefix: string;
};

export const serverSideRender = ({ vendorSourcePrefix }: ServerSideRender) => {
  const middleware: Middleware = async (ctx) => {
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
              __html: `
  import { createElement } from '${vendorSourcePrefix}/react';
  import { hydrateRoot } from '${vendorSourcePrefix}/react-dom/client';
  import { App } from '/.x/App.tsx';
  hydrateRoot(document.getElementById('root'),createElement(App));
  `,
            }}
          >
          </script>
        </body>
      </html>,
      {
        userAgent: ctx.request.headers.get('user-agent') || undefined,
      },
    )).readable;
  };

  return middleware;
};
