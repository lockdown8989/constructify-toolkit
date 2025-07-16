
export interface PredefinedAvatar {
  id: string;
  gradientClass: string;
  name: string;
}

export const predefinedAvatars: PredefinedAvatar[] = [
  {
    id: 'gradient-1',
    gradientClass: 'bg-gradient-to-r from-blue-500 to-purple-600',
    name: 'Blue Purple'
  },
  {
    id: 'gradient-2',
    gradientClass: 'bg-gradient-to-r from-green-400 to-blue-500',
    name: 'Green Blue'
  },
  {
    id: 'gradient-3',
    gradientClass: 'bg-gradient-to-r from-purple-400 to-pink-400',
    name: 'Purple Pink'
  },
  {
    id: 'gradient-4',
    gradientClass: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    name: 'Yellow Orange'
  },
  {
    id: 'gradient-5',
    gradientClass: 'bg-gradient-to-r from-red-400 to-pink-500',
    name: 'Red Pink'
  },
  {
    id: 'gradient-6',
    gradientClass: 'bg-gradient-to-r from-indigo-400 to-cyan-400',
    name: 'Indigo Cyan'
  },
  {
    id: 'gradient-7',
    gradientClass: 'bg-gradient-to-r from-emerald-400 to-teal-500',
    name: 'Emerald Teal'
  },
  {
    id: 'gradient-8',
    gradientClass: 'bg-gradient-to-r from-violet-400 to-purple-500',
    name: 'Violet Purple'
  }
];
