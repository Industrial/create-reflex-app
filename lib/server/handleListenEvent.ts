export type HandleListenEventProps = {
  hostname: string;
  port: number;
  secure: boolean;
};

export const handleListenEvent = (
  { hostname, port, secure }: HandleListenEventProps,
) => {
  const protocol = secure ? 'https' : 'http';
  console.log(`Listening on: ${protocol}://${hostname ?? 'localhost'}:${port}`);
};
