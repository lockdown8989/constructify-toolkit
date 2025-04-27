
/**
 * Utility functions for exporting data to CSV format
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: { [key in keyof T]?: string }
) {
  if (!data || data.length === 0) {
    console.error("No data to export");
    return;
  }

  // Get all keys from the first object
  const keys = Object.keys(data[0]) as Array<keyof T>;
  
  // Create header row using provided headers or object keys
  const headerRow = keys.map(key => headers?.[key] || String(key)).join(',');
  
  // Create data rows
  const rows = data.map(item => 
    keys.map(key => {
      // Handle values that might need escaping (commas, quotes, etc.)
      const value = item[key];
      const stringValue = value === null || value === undefined ? '' : String(value);
      
      // If value contains commas, quotes, or newlines, wrap in quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );
  
  // Combine header and data rows
  const csvContent = [headerRow, ...rows].join('\n');
  
  // Create a download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
