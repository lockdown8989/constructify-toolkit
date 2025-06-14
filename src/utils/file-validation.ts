
/**
 * File validation utilities for document uploads
 */

export const SUPPORTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
} as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'File size must be less than 50MB' };
  }

  // Check file type
  const supportedTypes = Object.keys(SUPPORTED_FILE_TYPES) as Array<keyof typeof SUPPORTED_FILE_TYPES>;
  if (!supportedTypes.includes(file.type as keyof typeof SUPPORTED_FILE_TYPES)) {
    return { isValid: false, error: 'File type not supported. Please upload PDF, Word, Excel, image, or text files.' };
  }

  return { isValid: true };
};

export const getFileTypeFromExtension = (filename: string): string => {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  
  // Use a more explicit approach to avoid TypeScript issues
  for (const mimeType of Object.keys(SUPPORTED_FILE_TYPES) as Array<keyof typeof SUPPORTED_FILE_TYPES>) {
    const extensions = SUPPORTED_FILE_TYPES[mimeType];
    if (extensions.includes(extension as any)) {
      return mimeType;
    }
  }
  
  return 'application/octet-stream';
};

export const isDocumentFile = (filename: string): boolean => {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return ['.pdf', '.doc', '.docx'].includes(extension);
};

export const isImageFile = (filename: string): boolean => {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return ['.jpg', '.jpeg', '.png', '.gif'].includes(extension);
};

export const getFileIcon = (filename: string): string => {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  
  switch (extension) {
    case '.pdf':
      return '📄';
    case '.doc':
    case '.docx':
      return '📝';
    case '.xls':
    case '.xlsx':
      return '📊';
    case '.jpg':
    case '.jpeg':
    case '.png':
    case '.gif':
      return '🖼️';
    case '.txt':
      return '📋';
    case '.csv':
      return '📈';
    default:
      return '📁';
  }
};
