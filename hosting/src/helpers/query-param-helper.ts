export const getQueryParam = (
  name: string,
  url: string = window.location.href
) => {
  const parsedUrl = new URL(url);
  return parsedUrl.searchParams.get(name);
};
