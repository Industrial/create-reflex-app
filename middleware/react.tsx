import type { Middleware } from 'oak';
import { renderToStream } from 'react-streaming/server';

export const react = (Element: JSX.Element) => {
  const middleware: Middleware = async ({ request, response }) => {
    const { readable } = await renderToStream(Element, {
      userAgent: request.headers.get('user-agent') || undefined,
    });

    response.headers.set('Content-Type', 'text/html');

    response.body = readable;
  };

  return middleware;
};
