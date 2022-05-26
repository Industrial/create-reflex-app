import { asyncMap } from '../object.ts';

type ImportMap = {
  imports: Record<string, string>;
};

export const getImportMap = async (): Promise<ImportMap> => {
  const importMap = JSON.parse(new TextDecoder('utf-8').decode(
    await Deno.readFile(`${Deno.cwd()}/importMap.json`),
  ));

  return importMap;
};

let importMapFiles: Record<string, string>;
export const getImportMapFiles = async (): Promise<Record<string, string>> => {
  if (importMapFiles) {
    return importMapFiles;
  }

  const importMap = await getImportMap();

  importMapFiles = await asyncMap(
    async (urlString: string) => {
      return await (await fetch(urlString)).text();
    },
    importMap.imports,
  );

  return importMapFiles;
};
