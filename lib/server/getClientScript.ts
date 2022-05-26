export const getClientScript = (): string => {
  return `import{createElement}from'react';import{hydrateRoot}from'react-dom/client';import{ReactStreaming}from'react-streaming/client';import{App}from'/.x/App.tsx';hydrateRoot(document.getElementById('root'),createElement(ReactStreaming,null,createElement(App)));`;
};
