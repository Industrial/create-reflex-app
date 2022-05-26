import React from 'react';

import { oak } from '../deps.ts';
import { reactStreamingServer } from '../deps.ts';
import { getClientScript } from '../lib/server/getClientScript.ts';
import { getImportMap } from '../lib/server/getImportMapFiles.ts';

export const react = (Element: JSX.Element) => {
  const middleware: oak.Middleware = async ({ request, response }) => {
    const ApplicationDocument = (
      <html>
        <head>
          <title>React Streaming</title>
        </head>
        <body>
          <div id='root'>{Element}</div>
          <script
            type='importmap'
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(await getImportMap()),
            }}
          >
          </script>
          <script
            type='module'
            defer
            dangerouslySetInnerHTML={{ __html: getClientScript() }}
          >
          </script>
        </body>
      </html>
    );

    const { readable } = await reactStreamingServer.renderToStream(
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
