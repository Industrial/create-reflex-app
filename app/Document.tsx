import React from 'react';
import { App } from './App.tsx';

export type DocumentProps = {
  vendorSourcePrefix: string;
};

export const Document = ({ vendorSourcePrefix }: DocumentProps) => {
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
