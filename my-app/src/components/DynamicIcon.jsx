import React from 'react';
import { 
  Home, 
  Plus, 
  Key, 
  Building2, 
  Construction, 
  TrendingUp, 
  MapPin, 
  Heart, 
  Search, 
  X,
  ChevronRight,
  Star,
  Bed,
  Bath,
  Car,
  Maximize
} from 'lucide-react';

// Icon mapping - add more icons as needed
const iconMap = {
  Home,
  Plus,
  Key,
  Building2,
  Construction,
  TrendingUp,
  MapPin,
  Heart,
  Search,
  X,
  ChevronRight,
  Star,
  Bed,
  Bath,
  Car,
  Maximize
};

/**
 * Dynamic Icon Component
 * Renders lucide-react icons dynamically based on icon name
 */
export const DynamicIcon = ({ name, size = 24, className = '', strokeWidth, ...props }) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in iconMap. Available icons:`, Object.keys(iconMap));
    return null;
  }
  
  return (
    <IconComponent 
      size={size} 
      className={className} 
      strokeWidth={strokeWidth}
      {...props} 
    />
  );
};

export default DynamicIcon;
