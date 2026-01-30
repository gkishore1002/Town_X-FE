import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Phone, Mail, MapPin, Home, 
  Bed, Bath, Square, Car, Calendar, Building2, CheckCircle2,
  ChevronLeft, ChevronRight, User, Shield, Clock, IndianRupee
} from 'lucide-react';
import { propertyAPI } from '../services/api';

const APP_LOGO_SRC = "/logo.png";
const APP_NAME = "Town Exchange";

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await propertyAPI.getPropertyById(id);
      setProperty(data);
    } catch (err) {
      setError('Failed to load property details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevImage = () => {
    if (property.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
    }
  };

  const handleNextImage = () => {
    if (property.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1));
    }
  };

  const handleToggleFavourite = async () => {
    try {
      const result = await propertyAPI.toggleFavourite(property.id);
      setProperty(prev => ({
        ...prev,
        is_favourite: result.is_favourite
      }));
    } catch (err) {
      console.error('Error toggling favourite:', err);
      alert('Failed to update favourite. Please try again.');
    }
  };

  const handleCallClick = () => {
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 2000);
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Price not available';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-sm">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 text-base font-medium mb-3">{error || 'Property not found'}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-4 py-3 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)} 
                className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={24} className="text-gray-700" />
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
              >
                <img
                  src={APP_LOGO_SRC}
                  alt={APP_NAME}
                  className="h-9 w-9 rounded-lg object-contain bg-white shadow-sm border border-gray-200"
                />
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-gray-900 leading-tight">
                    {APP_NAME}
                  </span>
                  <span className="text-xs text-gray-500 leading-tight hidden sm:block">
                    Property Details
                  </span>
                </div>
              </button>
            </div>
            
            <button 
              onClick={handleToggleFavourite}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Heart 
                size={22} 
                className={property.is_favourite ? 'fill-red-500 text-red-500' : 'text-gray-700'}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumbs - Desktop Only */}
      <div className="hidden md:block bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-gray-600 hover:text-purple-600 transition-colors group"
            >
              <Home size={16} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium">Home</span>
            </button>
            <ChevronRight size={16} className="text-gray-400" />
            <button 
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-purple-600 transition-colors font-medium"
            >
              Properties
            </button>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-purple-600 font-semibold truncate max-w-xs">
              {property.bhk_type || 'Property'} in {property.locality || 'Location'}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto">
        {/* Image Gallery */}
        <div className="relative bg-black">
          <div className="relative h-64 md:h-96 lg:h-[500px] overflow-hidden">
            <img 
              src={property.images && property.images.length > 0 && property.images[currentImageIndex]?.url 
                ? property.images[currentImageIndex].url 
                : 'https://via.placeholder.com/800x600?text=No+Image'} 
              alt={property.apartment_name || 'Property'}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setShowImageModal(true)}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
              }}
            />
            
            {property.images && property.images.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2.5 md:p-3 rounded-full hover:bg-black/80 transition-colors shadow-lg"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={handleNextImage}
                  className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2.5 md:p-3 rounded-full hover:bg-black/80 transition-colors shadow-lg"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {property.images && property.images.length > 0 && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                {currentImageIndex + 1} / {property.images.length}
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {property.images && property.images.length > 0 && (
            <div className="flex gap-2 md:gap-3 p-3 md:p-4 overflow-x-auto scrollbar-hide bg-gray-900">
              {property.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    currentImageIndex === index ? 'border-purple-500 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-80'
                  }`}
                >
                  <img src={img.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="lg:flex lg:gap-6 lg:px-6 lg:py-6">
          
          {/* Left Column - Main Details */}
          <div className="lg:flex-1 px-4 lg:px-0 py-4 space-y-5 pb-24 lg:pb-6">
            
            {/* Price & Title Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 hover:shadow-md transition-shadow">
              <div className="mb-3">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                  {property.bhk_type || 'Property'} {property.apartment_type || ''}
                  {property.apartment_name && ` in ${property.apartment_name}`}
                </h2>
                <div className="flex items-center gap-2 text-sm md:text-base text-gray-600">
                  <MapPin size={18} className="flex-shrink-0 text-purple-600" />
                  <span>{property.locality || 'Location'}, {property.city || 'City'}</span>
                </div>
              </div>
              
              <div className="flex items-baseline gap-2 mb-3">
                <p className="text-3xl md:text-4xl font-bold text-purple-600">
                  {formatPrice(property.expected_price)}
                </p>
                {property.property_for === 'Rent/Lease' && (
                  <span className="text-gray-500 text-base">/month</span>
                )}
              </div>

              {property.property_for === 'Rent/Lease' && (
                <div className="flex flex-wrap gap-4 text-sm md:text-base mb-3">
                  {property.security_deposit && property.security_deposit > 0 && (
                    <div>
                      <span className="text-gray-600">Security: </span>
                      <span className="font-semibold text-gray-800">{formatPrice(property.security_deposit)}</span>
                    </div>
                  )}
                  {property.maintenance_charges && property.maintenance_charges > 0 && (
                    <div>
                      <span className="text-gray-600">Maintenance: </span>
                      <span className="font-semibold text-gray-800">{formatPrice(property.maintenance_charges)}/mo</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-3 border-t">
                <span className={`px-3.5 py-1.5 rounded-full text-sm font-semibold ${
                  property.property_for === 'Sell' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  For {property.property_for || 'N/A'}
                </span>
                {property.apartment_type && (
                  <span className="px-3.5 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                    {property.apartment_type}
                  </span>
                )}
                {property.bhk_type && (
                  <span className="px-3.5 py-1.5 rounded-full text-sm font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                    {property.bhk_type}
                  </span>
                )}
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Property Overview</h3>
              
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {property.bhk_type && property.bhk_type.split(' ')[0] !== 'Studio' && (
                  <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all">
                    <Bed className="mx-auto mb-2 text-purple-600" size={28} />
                    <p className="text-xs text-gray-600 mb-1">Bedrooms</p>
                    <p className="font-bold text-gray-900 text-base">{property.bhk_type.split(' ')[0]}</p>
                  </div>
                )}
                {property.bathrooms !== undefined && property.bathrooms > 0 && (
                  <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all">
                    <Bath className="mx-auto mb-2 text-purple-600" size={28} />
                    <p className="text-xs text-gray-600 mb-1">Bathrooms</p>
                    <p className="font-bold text-gray-900 text-base">{property.bathrooms}</p>
                  </div>
                )}
                {property.carpet_area && property.carpet_area > 0 && (
                  <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all">
                    <Square className="mx-auto mb-2 text-purple-600" size={28} />
                    <p className="text-xs text-gray-600 mb-1">Carpet Area</p>
                    <p className="font-bold text-gray-900 text-base">{property.carpet_area} sqft</p>
                  </div>
                )}
                {property.balconies !== undefined && property.balconies > 0 && (
                  <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all">
                    <Home className="mx-auto mb-2 text-purple-600" size={28} />
                    <p className="text-xs text-gray-600 mb-1">Balconies</p>
                    <p className="font-bold text-gray-900 text-base">{property.balconies}</p>
                  </div>
                )}
                {property.parking !== undefined && property.parking > 0 && (
                  <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all">
                    <Car className="mx-auto mb-2 text-purple-600" size={28} />
                    <p className="text-xs text-gray-600 mb-1">Parking</p>
                    <p className="font-bold text-gray-900 text-base">{property.parking}</p>
                  </div>
                )}
                {property.floor && property.total_floors && (
                  <div className="text-center p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all">
                    <Building2 className="mx-auto mb-2 text-purple-600" size={28} />
                    <p className="text-xs text-gray-600 mb-1">Floor</p>
                    <p className="font-bold text-gray-900 text-base">{property.floor}/{property.total_floors}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Property Details</h3>
              <div className="space-y-3">
                {property.property_type && (
                  <div className="flex justify-between py-2.5 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors">
                    <span className="text-gray-600 text-sm md:text-base">Property Type</span>
                    <span className="font-semibold text-gray-900 text-sm md:text-base">{property.property_type}</span>
                  </div>
                )}
                {property.apartment_name && (
                  <div className="flex justify-between py-2.5 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors">
                    <span className="text-gray-600 text-sm md:text-base">Apartment Name</span>
                    <span className="font-semibold text-gray-900 text-sm md:text-base">{property.apartment_name}</span>
                  </div>
                )}
                {property.carpet_area && property.carpet_area > 0 && (
                  <div className="flex justify-between py-2.5 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors">
                    <span className="text-gray-600 text-sm md:text-base">Carpet Area</span>
                    <span className="font-semibold text-gray-900 text-sm md:text-base">{property.carpet_area} sq.ft</span>
                  </div>
                )}
                <div className="flex justify-between py-2.5 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors">
                  <span className="text-gray-600 text-sm md:text-base">Built-up Area</span>
                  <span className="font-semibold text-gray-900 text-sm md:text-base">
                    {property.built_up_area && property.built_up_area > 0 
                      ? `${property.built_up_area} sq.ft` 
                      : 'Not mentioned'}
                  </span>
                </div>
                {property.bathrooms !== undefined && property.bathrooms > 0 && (
                  <div className="flex justify-between py-2.5 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors">
                    <span className="text-gray-600 text-sm md:text-base">Bathrooms</span>
                    <span className="font-semibold text-gray-900 text-sm md:text-base">{property.bathrooms}</span>
                  </div>
                )}
                {property.balconies !== undefined && property.balconies > 0 && (
                  <div className="flex justify-between py-2.5 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors">
                    <span className="text-gray-600 text-sm md:text-base">Balconies</span>
                    <span className="font-semibold text-gray-900 text-sm md:text-base">{property.balconies}</span>
                  </div>
                )}
                {property.parking !== undefined && property.parking > 0 && (
                  <div className="flex justify-between py-2.5 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors">
                    <span className="text-gray-600 text-sm md:text-base">Parking</span>
                    <span className="font-semibold text-gray-900 text-sm md:text-base">{property.parking}</span>
                  </div>
                )}
                {property.floor && property.total_floors && (
                  <div className="flex justify-between py-2.5 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors">
                    <span className="text-gray-600 text-sm md:text-base">Floor</span>
                    <span className="font-semibold text-gray-900 text-sm md:text-base">{property.floor} of {property.total_floors}</span>
                  </div>
                )}
                {property.property_age && (
                  <div className="flex justify-between py-2.5 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors">
                    <span className="text-gray-600 text-sm md:text-base">Property Age</span>
                    <span className="font-semibold text-gray-900 text-sm md:text-base">{property.property_age}</span>
                  </div>
                )}
                {property.furnishing_status && (
                  <div className="flex justify-between py-2.5 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors">
                    <span className="text-gray-600 text-sm md:text-base">Furnishing Status</span>
                    <span className="font-semibold text-gray-900 text-sm md:text-base">{property.furnishing_status}</span>
                  </div>
                )}
                {property.available_from && (
                  <div className="flex justify-between py-2.5 hover:bg-gray-50 px-2 rounded transition-colors">
                    <span className="text-gray-600 text-sm md:text-base">Available From</span>
                    <span className="font-semibold text-gray-900 text-sm md:text-base">
                      {new Date(property.available_from).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && Array.isArray(property.amenities) && property.amenities.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm md:text-base text-gray-700 p-2.5 hover:bg-gray-50 rounded-lg transition-colors">
                      <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Property Description</h3>
                <p className="text-gray-700 text-sm md:text-base leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Location */}
            {property.address && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Location</h3>
                <div className="flex items-start gap-2.5 mb-4 p-3 bg-gray-50 rounded-lg">
                  <MapPin size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm md:text-base text-gray-700">{property.address}</p>
                </div>
                <div className="w-full h-56 md:h-72 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
                  <div className="text-center">
                    <MapPin size={40} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Map integration coming soon</p>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Contact Section */}
            <div className="lg:hidden bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Details</h3>
              
              <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
                <Shield size={18} className="text-emerald-500 flex-shrink-0" />
                <div className="flex-1 flex items-center gap-2 text-sm text-gray-700">
                  <span>Verified {property.user_type || 'Owner'}</span>
                  <span className="text-gray-400">•</span>
                  <Clock size={14} className="flex-shrink-0 text-gray-400" />
                  <span className="text-gray-600">{formatDate(property.created_at)}</span>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-800 mb-1 font-medium">Contact Information</p>
                  <p className="text-sm text-purple-700">Click below to view phone & email</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Contact Card (Desktop Only) */}
          <div className="hidden lg:block lg:w-96">
            <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Contact Owner</h3>
              
              <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
                <Shield size={18} className="text-emerald-500 flex-shrink-0" />
                <div className="flex-1 flex items-center gap-2 text-sm text-gray-700">
                  <span>Verified {property.user_type || 'Owner'}</span>
                  <span className="text-gray-400">•</span>
                  <Clock size={14} className="flex-shrink-0 text-gray-400" />
                  <span className="text-gray-600">{formatDate(property.created_at)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-800 mb-1 font-medium">Contact Information</p>
                  <p className="text-sm text-purple-700">Click below to view phone & email</p>
                </div>

                <button 
                  onClick={handleCallClick}
                  className="w-full py-3 px-4 rounded-lg bg-white border-2 border-purple-600 text-purple-600 font-semibold text-sm transition-all hover:bg-purple-50 hover:scale-105 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Phone size={18} />
                  Call Owner
                </button>
                <button 
                  onClick={handleCallClick}
                  className="w-full py-3 px-4 rounded-lg text-white font-semibold text-sm transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-md"
                  style={{ backgroundColor: '#7C01A2' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5D1578'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7C01A2'}
                >
                  <Mail size={18} />
                  Send Message
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  For safety, don't transfer money before viewing the property
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg z-30">
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          <button 
            onClick={handleCallClick}
            className="py-3 px-4 rounded-lg bg-white border-2 border-purple-600 text-purple-600 font-semibold text-sm transition-all hover:bg-purple-50 flex items-center justify-center gap-2"
          >
            <Phone size={18} />
            <span>Call</span>
          </button>
          <button 
            onClick={handleCallClick}
            className="py-3 px-4 rounded-lg text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: '#7C01A2' }}
          >
            <Mail size={18} />
            <span>Message</span>
          </button>
        </div>
      </div>

      {/* Coming Soon Toast */}
      {showComingSoon && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[9999]">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl">
            <p className="text-sm font-medium">📞 Feature coming soon!</p>
          </div>
        </div>
      )}

      {/* Image Modal with Custom Close Icon */}
      {showImageModal && property.images && property.images.length > 0 && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button 
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm p-2.5 rounded-full hover:bg-white/20 transition-colors z-10 border border-white/20"
          >
            <img 
              src="/red-cross.svg" 
              alt="Close" 
              className="w-6 h-6 brightness-0 invert"
            />
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img 
              src={property.images[currentImageIndex]?.url} 
              alt={property.apartment_name || 'Property'}
              className="max-w-full max-h-full object-contain"
            />
            
            {property.images.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-4 bg-white/10 backdrop-blur-sm text-white p-4 rounded-full hover:bg-white/20 transition-colors border border-white/20"
                >
                  <ChevronLeft size={28} />
                </button>
                <button 
                  onClick={handleNextImage}
                  className="absolute right-4 bg-white/10 backdrop-blur-sm text-white p-4 rounded-full hover:bg-white/20 transition-colors border border-white/20"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
            {currentImageIndex + 1} / {property.images.length}
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
