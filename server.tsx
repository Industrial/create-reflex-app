import React from 'react';
import { Application } from 'oak';

import { App } from './app/App.tsx';
import { handleListenEvent } from './lib/server/handleListenEvent.ts';
import { logger } from './middleware/logger.ts';
import { staticFiles } from './middleware/staticFiles.ts';
import { react } from './middleware/react.tsx';
import { timing } from './middleware/timing.ts';

const app = new Application();

app.use(logger);
app.use(timing);
app.use(staticFiles({
  directory: `${Deno.cwd()}/public`,
}));

const ServerApplication = () => {
  return <App />;
};

app.use(react(<ServerApplication />));

app.addEventListener('listen', handleListenEvent);

await app.listen({
  hostname: Deno.env.get('hostname') ?? 'localhost',
  port: Number(Deno.env.get('port') ?? 8000),
});
