
/**
 * Formats a file size in bytes to a human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Gets the appropriate icon for a document type
 */
export const getDocumentTypeIcon = (docType: string | undefined) => {
  if (!docType) return 'file';
  
  const lowercaseType = docType.toLowerCase();
  
  if (lowercaseType.includes('pdf')) {
    return 'file-text';
  } else if (lowercaseType.includes('word') || lowercaseType.includes('doc')) {
    return 'file-text';
  } else if (lowercaseType.includes('excel') || lowercaseType.includes('xls')) {
    return 'file-spreadsheet';
  } else if (lowercaseType.includes('image') || lowercaseType.includes('jpg') || lowercaseType.includes('png')) {
    return 'image';
  } else {
    return 'file';
  }
};

/**
 * Gets a color for a document type icon
 */
export const getDocumentTypeColor = (docType: string | undefined): string => {
  if (!docType) return 'text-gray-500';
  
  const lowercaseType = docType.toLowerCase();
  
  if (lowercaseType.includes('pdf')) {
    return 'text-red-500';
  } else if (lowercaseType.includes('word') || lowercaseType.includes('doc')) {
    return 'text-blue-500';
  } else if (lowercaseType.includes('excel') || lowercaseType.includes('xls')) {
    return 'text-green-500';
  } else if (lowercaseType.includes('image')) {
    return 'text-purple-500';
  } else {
    return 'text-gray-500';
  }
};
