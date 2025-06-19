
import React, { useEffect, useRef } from 'react';

interface Restriction {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active: boolean;
}

interface EmployeeLocation {
  id: string;
  employee_id: string;
  latitude: number;
  longitude: number;
  is_within_restriction: boolean;
  recorded_at: string;
}

interface GPSMapViewProps {
  restrictions: Restriction[];
  employeeLocations: EmployeeLocation[];
  selectedRestriction?: string | null;
  onRestrictionSelect?: (id: string) => void;
}

const GPSMapView: React.FC<GPSMapViewProps> = ({
  restrictions,
  employeeLocations,
  selectedRestriction,
  onRestrictionSelect
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create a simple map placeholder since we don't have Google Maps
    // This would be replaced with actual map implementation
    const mapContainer = mapRef.current;
    mapContainer.innerHTML = `
      <div class="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center relative overflow-hidden">
        <div class="absolute inset-0 opacity-10">
          <svg viewBox="0 0 100 100" class="w-full h-full">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#94a3b8" stroke-width="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <div class="text-center z-10">
          <div class="text-lg font-semibold text-gray-600 mb-2">Interactive Map View</div>
          <div class="text-sm text-gray-500">GPS restrictions and employee locations</div>
        </div>
      </div>
    `;

    // Add restriction markers
    restrictions.forEach((restriction, index) => {
      const marker = document.createElement('div');
      marker.className = `absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-20`;
      marker.style.left = `${20 + (index * 15)}%`;
      marker.style.top = `${30 + (index * 10)}%`;
      marker.title = restriction.name;
      
      marker.onclick = () => onRestrictionSelect?.(restriction.id);
      
      if (selectedRestriction === restriction.id) {
        marker.className += ' ring-2 ring-blue-300';
      }
      
      mapContainer.appendChild(marker);

      // Add radius circle
      const circle = document.createElement('div');
      circle.className = 'absolute border-2 border-blue-300 bg-blue-100 bg-opacity-20 rounded-full transform -translate-x-1/2 -translate-y-1/2';
      const circleSize = Math.max(20, Math.min(80, restriction.radius_meters / 10));
      circle.style.width = `${circleSize}px`;
      circle.style.height = `${circleSize}px`;
      circle.style.left = `${20 + (index * 15)}%`;
      circle.style.top = `${30 + (index * 10)}%`;
      circle.style.zIndex = '10';
      
      mapContainer.appendChild(circle);
    });

    // Add employee location markers
    employeeLocations.forEach((location, index) => {
      const marker = document.createElement('div');
      const isInZone = location.is_within_restriction;
      marker.className = `absolute w-3 h-3 rounded-full border border-white shadow-sm transform -translate-x-1/2 -translate-y-1/2 z-30 ${
        isInZone ? 'bg-green-500' : 'bg-red-500'
      }`;
      marker.style.left = `${60 + (index * 8)}%`;
      marker.style.top = `${20 + (index * 12)}%`;
      marker.title = `Employee ${isInZone ? 'in zone' : 'outside zone'}`;
      
      mapContainer.appendChild(marker);
    });

  }, [restrictions, employeeLocations, selectedRestriction, onRestrictionSelect]);

  return (
    <div ref={mapRef} className="w-full h-full">
      {/* Fallback content will be replaced by the map */}
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    </div>
  );
};

export default GPSMapView;
