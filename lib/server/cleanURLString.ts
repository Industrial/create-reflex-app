export const cleanURLString = (
  urlString: string,
  bundle = true,
  dev = false,
): string => {
  const { origin, pathname, searchParams } = new URL(urlString);

  if (bundle) {
    searchParams.set('bundle', 'true');
  } else {
    searchParams.delete('bundle');
  }

  if (dev) {
    searchParams.set('dev', 'true');
  } else {
    searchParams.delete('dev');
  }

  const cleanSearch = searchParams.toString();
  const search = cleanSearch ? `?${cleanSearch}` : '';

  return `${origin}${pathname}${search}`;
};
