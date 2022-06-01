import React from 'react';
import { Middleware } from 'https://deno.land/x/oak@v10.6.0/mod.ts';
import { renderToStream } from 'https://esm.sh/react-streaming@0.2.13/server?deps=react@18,react-dom@18&dev';

import { App } from '../../app/App.tsx';
import { concatenateReadableStreams, stringToStream } from '../stream.ts';

export type ServerSideRender = {
  vendorSourcePrefix: string;
};

export const serverSideRender = ({ vendorSourcePrefix }: ServerSideRender) => {
  // deno-lint-ignore require-await
  const middleware: Middleware = async (ctx) => {
    const topReadableStream = stringToStream(`
<html>
  <head>
    <title>React Streaming</title>
  </head>
  <body>
    <div id='root'>
    `);

    const applicationReadableStream = (await renderToStream(<App />, {
      userAgent: ctx.request.headers.get('user-agent') || undefined,
    })).readable;
    if (!applicationReadableStream) {
      throw new Error(`Application could not be rendered`);
    }

    const bottomReadableStream = stringToStream(`
    </div>
    <script
      type='module'
      defer
    >
      import { createElement } from '${vendorSourcePrefix}/react';
      import { hydrateRoot } from '${vendorSourcePrefix}/react-dom/client';
      import { App } from '/.x/App.tsx';
      hydrateRoot(document.getElementById('root'),createElement(App));
    </script>
  </body>
</html>
    `);

    const outputReadableStream = concatenateReadableStreams(
      topReadableStream,
      applicationReadableStream,
      bottomReadableStream,
    );

    ctx.response.headers.set('Content-Type', 'text/html');
    ctx.response.body = outputReadableStream;
  };

  return middleware;
};
