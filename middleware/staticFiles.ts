import { oak } from '../deps.ts';

export type PublicFileProps = {
  directory: string;
};

export const staticFiles = ({ directory }: PublicFileProps) => {
  const middleware: oak.Middleware = async (ctx, next) => {
    const path = await ctx.send({
      root: directory,
    });
    if (!path) {
      await next();
    }
  };

  return middleware;
};
