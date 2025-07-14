export const predefinedAvatars = [
  // Row 1
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png", // Using the uploaded image as source for all avatars
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  
  // Row 2
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  
  // Row 3
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  
  // Row 4
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  
  // Row 5
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  
  // Row 6
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  
  // Row 7
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  
  // Row 8
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  
  // Row 9
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  
  // Row 10
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
  "/lovable-uploads/1e168dde-ea14-4929-8331-53ef51ff0cf5.png",
];

export const getAvatarVariant = (index: number, totalAvatars: number) => {
  const variants = [
    'bg-gradient-to-br from-green-400 to-green-600',
    'bg-gradient-to-br from-blue-400 to-blue-600',
    'bg-gradient-to-br from-purple-400 to-purple-600',
    'bg-gradient-to-br from-orange-400 to-orange-600',
    'bg-gradient-to-br from-pink-400 to-pink-600',
    'bg-gradient-to-br from-indigo-400 to-indigo-600',
    'bg-gradient-to-br from-teal-400 to-teal-600',
    'bg-gradient-to-br from-red-400 to-red-600',
  ];
  
  return variants[index % variants.length];
};