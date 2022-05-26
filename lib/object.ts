export type MapFunction<T> = (value: T, k: string) => T;
export type AsyncMapFunction<T> = (value: T, k: string) => Promise<T>;

export const reduceWithEntry = <T>(
  a: Record<string, T>,
  [k, v]: [string, T],
) => {
  a[k] = v;
  return a;
};

export const entryApply = <T>(fn: MapFunction<T>) => {
  return ([key, value]: [string, T]): [string, T] => {
    return [key, fn(value, key)];
  };
};

export const asyncEntryApply = <T>(fn: AsyncMapFunction<T>) => {
  return async ([key, value]: [string, T]): Promise<[string, T]> => {
    return [key, await fn(value, key)];
  };
};

export const asyncMap = async <T, U extends Record<string, T>>(
  fn: AsyncMapFunction<T>,
  o: U,
) => {
  return (await Promise.all(Object.entries(o).map(asyncEntryApply<T>(fn))))
    .reduce(reduceWithEntry, {} as Record<string, T>);
};
