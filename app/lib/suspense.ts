export function wrapPromise<T>(promise: Promise<T>) {
  let status = 'pending';
  let result: T | Error;

  const suspender = promise.then(
    (_result: T) => {
      status = 'success';
      result = _result;
    },
    (_error: Error) => {
      status = 'error';
      result = _error;
    },
  );

  const read = () => {
    switch (status) {
      case 'success':
        return result as T;
      case 'error':
        throw result as Error;
      case 'pending':
      default:
        throw suspender;
    }
  };

  return {
    read,
  };
}

export function fetchData<T>(url: string) {
  return wrapPromise<T>(
    fetch(url).then((result) => {
      return result.json();
    }),
  );
}
