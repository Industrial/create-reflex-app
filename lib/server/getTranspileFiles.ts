import { asyncMap } from '../object.ts';
import { transpileFile } from './transpileFile.ts';
import { walk } from '../../deps.ts';

let transpileFiles: Record<string, string>;
export const getTranspileFiles = async (
  directoryPath: string,
): Promise<Record<string, string>> => {
  if (transpileFiles) {
    return transpileFiles;
  }

  const output: Record<string, string> = {};

  for await (
    const entry of walk(directoryPath, {
      includeDirs: false,
      followSymlinks: true,
      exts: [
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
      ],
    })
  ) {
    const path = entry.path.replace(`${directoryPath}/`, '');
    output[path] = entry.path;
  }

  transpileFiles = await asyncMap(
    transpileFile,
    await asyncMap((value: string) => {
      return Deno.readTextFile(value);
    }, output),
  );

  return transpileFiles;
};
