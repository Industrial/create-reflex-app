export const externalToInternalURL = (
  externalURL: string,
  vendorSourcePrefix: string,
): string => {
  const url = new URL(externalURL);
  return `${vendorSourcePrefix}/${url.hostname}${url.pathname}`;
};

export const internalToExternalURL = (
  internalURL: string,
  vendorSourcePrefix: string,
): string => {
  const url = new URL(internalURL);
  const pathname = url.pathname.replace(`${vendorSourcePrefix}/`, '');
  return `https://${pathname}`;
};
