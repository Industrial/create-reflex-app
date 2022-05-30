import { Middleware } from 'https://deno.land/x/oak@v10.6.0/mod.ts';

export const logger = () => {
  const middleware: Middleware = async (ctx, next) => {
    console.log(`<--     ${ctx.request.method} ${ctx.request.url}`);
    await next();
    console.log(
      `--> ${ctx.response.status} ${ctx.request.method} ${ctx.request.url}`,
    );
  };

  return middleware;
};
