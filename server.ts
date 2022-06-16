import { Application, reflexMiddleware } from './deps.ts';
import { Document } from './app/Document.tsx';

const hostname = Deno.env.get('hostname') ?? '127.0.0.1';
const port = Number(Deno.env.get('port') ?? 3000);
const app = new Application();

app.use(reflexMiddleware({
  Document,
  cacheMethod: 'disk',
}));

console.log(`Listening on http://${hostname}:${port}`);

await app.listen({
  hostname,
  port,
});
