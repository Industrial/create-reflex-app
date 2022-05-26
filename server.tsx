import React from 'react';

import { App } from './app/App.tsx';
import { handleListenEvent } from './lib/server/handleListenEvent.ts';
import { logger } from './middleware/logger.ts';
import { oak } from './deps.ts';
import { react } from './middleware/react.tsx';
import { staticFiles } from './middleware/staticFiles.ts';
import { timing } from './middleware/timing.ts';
import { transpile } from './middleware/transpile.ts';

const app = new oak.Application();

app.use(logger);
app.use(timing);
app.use(transpile({
  directory: `${Deno.cwd()}/app`,
}));
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
