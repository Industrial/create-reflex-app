// Creates a stream from several streams and concatenates them.
export function concatenateReadableStreams<T>(
  ...streams: Array<ReadableStream<T>>
): ReadableStream<T> {
  const { readable, writable } = new TransformStream();
  (async () => {
    for (const stream of streams) {
      await stream.pipeTo(writable);
    }
  })();
  return readable;
}
