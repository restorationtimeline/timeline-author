export const isValidUrl = (urlString: string) => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const formatUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Remove any trailing colons from hostname
    urlObj.hostname = urlObj.hostname.replace(/:+$/, '');
    return urlObj.toString();
  } catch {
    return url;
  }
};