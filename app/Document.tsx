import React from 'react';
import type { DocumentElement } from '../deps.ts';

import { App } from './App.tsx';

export const Document: DocumentElement = ({ vendorSourcePrefix }) => {
  return (
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
                import { createRoot, hydrateRoot } from '${vendorSourcePrefix}/react-dom/client';
                import { App } from '/.x/App.tsx';
                const rootElement = document.getElementById('root');
                const appElement = createElement(App);
                hydrateRoot(rootElement, appElement);
              `,
          }}
        >
        </script>
      </body>
    </html>
  );
};
