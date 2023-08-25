export const generateUrlWithParams = (
  url: string,
  params: { [key: string]: string }
): string => {
  const urlWithParams = new URL(url);
  Object.keys(params).forEach((key) => {
    urlWithParams.searchParams.append(key, params[key]);
  });
  return urlWithParams.toString();
};
