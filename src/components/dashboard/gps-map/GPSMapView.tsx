
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
    
    // Secure DOM creation without innerHTML to prevent XSS
    const mapDiv = document.createElement('div');
    mapDiv.className = 'w-full h-full bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center relative overflow-hidden';
    
    const backgroundDiv = document.createElement('div');
    backgroundDiv.className = 'absolute inset-0 opacity-10';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('class', 'w-full h-full');
    
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', 'grid');
    pattern.setAttribute('width', '10');
    pattern.setAttribute('height', '10');
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M 10 0 L 0 0 0 10');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#94a3b8');
    path.setAttribute('stroke-width', '0.5');
    
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100');
    rect.setAttribute('height', '100');
    rect.setAttribute('fill', 'url(#grid)');
    
    pattern.appendChild(path);
    defs.appendChild(pattern);
    svg.appendChild(defs);
    svg.appendChild(rect);
    backgroundDiv.appendChild(svg);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'text-center z-10';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'text-lg font-semibold text-gray-600 mb-2';
    titleDiv.textContent = 'Interactive Map View';
    
    const subtitleDiv = document.createElement('div');
    subtitleDiv.className = 'text-sm text-gray-500';
    subtitleDiv.textContent = 'GPS restrictions and employee locations';
    
    contentDiv.appendChild(titleDiv);
    contentDiv.appendChild(subtitleDiv);
    mapDiv.appendChild(backgroundDiv);
    mapDiv.appendChild(contentDiv);
    mapContainer.appendChild(mapDiv);

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
