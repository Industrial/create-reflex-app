import { Application } from 'https://deno.land/x/oak@v10.6.0/mod.ts';

import { appSource } from './lib/middleware/appSource.ts';
import { logger } from './lib/middleware/logger.ts';
import { serverSideRender } from './lib/middleware/serverSideRender.tsx';
import { staticFile } from './lib/middleware/staticFile.ts';
import { vendorSource } from './lib/middleware/vendorSource.ts';

const hostname = Deno.env.get('hostname') ?? '127.0.0.1';
const port = Number(Deno.env.get('port') ?? 8000);
const app = new Application();
const appSourcePrefix = '/.x';
const vendorSourcePrefix = '/.v';

app.use(logger());
app.use(vendorSource({ vendorSourcePrefix }));
app.use(appSource({ appSourcePrefix }));
app.use(staticFile());
app.use(serverSideRender({ vendorSourcePrefix }));

console.log(`Listening on http://${hostname}:${port}`);

await app.listen({
  hostname,
  port,
});
