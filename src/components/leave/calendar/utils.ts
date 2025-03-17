
/**
 * Returns the background color class for a leave type
 */
export const getTypeColor = (type: string): string => {
  switch (type) {
    case "Holiday":
      return "bg-blue-500";
    case "Sickness":
      return "bg-red-500";
    case "Personal":
      return "bg-purple-500";
    case "Parental":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

/**
 * Returns the background color class for a leave status
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "Approved":
      return "bg-green-500";
    case "Rejected":
      return "bg-red-500";
    default:
      return "bg-yellow-500";
  }
};
