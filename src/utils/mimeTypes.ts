import mime from 'mime-types';

export const getFriendlyMimeType = (type: string | null): string => {
  if (!type) return "Unknown";
  
  // Get the extension from the MIME type
  const extension = mime.extension(type);
  if (!extension) return type;
  
  // Convert to uppercase for display
  return extension.toUpperCase();
};