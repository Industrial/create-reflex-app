import React from 'react';
import type { Middleware } from 'oak';
import { renderToStream } from 'react-streaming/server';

export const react = (Element: JSX.Element) => {
  const middleware: Middleware = async ({ request, response }) => {
    const ApplicationDocument = (
      <html>
        <head>
          <title>React Streaming</title>
        </head>
        <body>
          {Element}
          <script type='module' src='/main.js' async></script>
        </body>
      </html>
    );

    const { readable } = await renderToStream(
      ApplicationDocument,
      {
        userAgent: request.headers.get('user-agent') || undefined,
      },
    );

    response.headers.set('Content-Type', 'text/html');

    response.body = readable;
  };

  return middleware;
};
