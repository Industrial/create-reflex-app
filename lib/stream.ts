// Creates a stream from several streams and concatenates them.
export function concatenateReadableStreams<T>(
  ...streams: Array<ReadableStream<T>>
): ReadableStream<T> {
  const { readable, writable } = new TransformStream();
  (async () => {
    try {
      let i = 0;
      for (const stream of streams) {
        await stream.pipeTo(writable, {
          preventClose: true,
        });
        i = i + 1;
        if (i === streams.length) {
          await writable.close();
        }
      }
    } catch (error: unknown) {
      console.error(error);
      throw error;
    }
  })();
  return readable;
}

export function stringToStream(input: string): ReadableStream<string> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(input);
      controller.close();
    },
  });
}
