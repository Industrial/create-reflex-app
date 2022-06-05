import React from 'react';
import type { DocumentComponent } from 'https://deno.land/x/reflex@v0.4.0/mod.ts';

import { App } from './App.tsx';

export const Document: DocumentComponent = ({ vendorSourcePrefix }) => {
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
                // const root = createRoot(rootElement);
                // root.render(appElement);
              `,
          }}
        >
        </script>
      </body>
    </html>
  );
};
