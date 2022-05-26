import { parseSync, printSync, transformSync, wasmWeb } from '../../deps.ts';

await wasmWeb('https://cdn.esm.sh/@swc/wasm-web@1.2.189/wasm-web_bg.wasm');

const parserOptions = {
  syntax: 'typescript',
  tsx: true,
  dynamicImport: true,
};

export const transpileFile = async (
  source: string,
): Promise<string> => {
  const transformResult = await transformSync(source, {
    jsc: {
      parser: parserOptions,
      target: 'es2022',
    },
  });
  const ast = await parseSync(transformResult.code, parserOptions);
  const { code } = printSync(ast, { minify: true });
  return code;
};
