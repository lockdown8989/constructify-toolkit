
/**
 * Returns a CSS class for styling department/position elements
 */
export function getColorByDepartment(department: string): string {
  const deptLower = department.toLowerCase();
  
  if (deptLower.includes('operations') || deptLower.includes('admin')) {
    return 'bg-red-100';
  } else if (deptLower.includes('office') || deptLower.includes('front')) {
    return 'bg-blue-100';
  } else if (deptLower.includes('shipping')) {
    return 'bg-amber-100';
  } else if (deptLower.includes('back') || deptLower.includes('support')) {
    return 'bg-green-100';
  } else if (deptLower.includes('hr') || deptLower.includes('human')) {
    return 'bg-purple-100';
  } else if (deptLower.includes('sales') || deptLower.includes('marketing')) {
    return 'bg-pink-100';
  }
  
  // Fallback based on first letter to ensure consistent colors
  const charCode = department.charCodeAt(0);
  const colorIndex = charCode % 6;
  
  const colors = [
    'bg-blue-100',
    'bg-green-100',
    'bg-red-100',
    'bg-amber-100',
    'bg-purple-100',
    'bg-pink-100'
  ];
  
  return colors[colorIndex];
}

/**
 * Returns a random color for new items
 */
export function getRandomColor(): string {
  const colors = [
    'bg-blue-100',
    'bg-green-100',
    'bg-red-100',
    'bg-amber-100',
    'bg-purple-100',
    'bg-pink-100'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}
