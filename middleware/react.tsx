import React, { ComponentType } from 'react';
import type { Middleware } from 'oak';
import { renderToReadableStream } from 'react-dom/server';

export const react = (Component: ComponentType) => {
  const middleware: Middleware = async (ctx) => {
    const stream = await renderToReadableStream(<Component />);

    ctx.response.headers.set('Content-Type', 'text/html');

    ctx.response.body = stream;
  };

  return middleware;
};
