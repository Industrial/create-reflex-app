import { oak } from '../deps.ts';
import { getTranspileFiles } from '../lib/server/getTranspileFiles.ts';
import { getImportMapFiles } from '../lib/server/getImportMapFiles.ts';

export type TranspileProps = {
  directory: string;
};

export const transpile = ({ directory }: TranspileProps) => {
  const middleware: oak.Middleware = async ({ request, response }, next) => {
    if (!request.url.pathname.startsWith('/.x/')) {
      await next();
      return;
    }

    const pathname = request.url.pathname.replace('/.x/', '');

    // const importMapFiles = await getImportMapFiles();
    // const importMapResult = importMapFiles[pathname];
    // if (importMapResult) {
    //   response.headers.set('Content-Type', 'text/javascript;charset=UTF-8');
    //   response.body = importMapResult;
    //   return;
    // }

    const transpileFiles = await getTranspileFiles(directory);
    const transpileFileResult = transpileFiles[pathname];

    if (transpileFileResult) {
      response.headers.set('Content-Type', 'text/javascript;charset=UTF-8');
      response.body = transpileFileResult;
      return;
    }

    await next();
  };

  return middleware;
};
