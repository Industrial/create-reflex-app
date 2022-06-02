import { reflexMiddleware } from 'https://deno.land/x/reflex@v0.1.1/mod.ts';
import { Application } from 'https://deno.land/x/oak@v10.6.0/mod.ts';

import { Document } from './app/Document.tsx';

const app = new Application();

app.use(
  await reflexMiddleware({ Document }),
);

await app.listen({
  hostname: Deno.env.get('hostname') ?? '127.0.0.1',
  port: Number(Deno.env.get('port') ?? 3000),
});
