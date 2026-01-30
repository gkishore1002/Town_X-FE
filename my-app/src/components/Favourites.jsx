import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, ArrowLeft, MapPin, Bed, Bath, Square, Heart, Phone, Filter, Eye, HeartOff } from 'lucide-react';
import { propertyAPI } from '../services/api';

export default function Favourites() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFavourites();
  }, []);

  const loadFavourites = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch favourites from backend using is_favourite field
      const favourites = await propertyAPI.getFavourites();
      setProperties(favourites);
    } catch (err) {
      console.error('Error loading favourites:', err);
      setError('Failed to load favourites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavourite = async (propertyId) => {
    try {
      // Toggle favourite in backend (will set is_favourite to false)
      await propertyAPI.toggleFavourite(propertyId);
      
      // Remove from display
      setProperties(properties.filter(p => p.id !== propertyId));
    } catch (err) {
      console.error('Error removing favourite:', err);
      alert('Failed to remove favourite');
    }
  };

  const handlePropertyClick = (propertyId) => {
    navigate(`/property-details/${propertyId}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadFavourites();
      return;
    }

    const filtered = properties.filter(property => 
      property.locality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.apartment_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setProperties(filtered);
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Price not available';
    
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numPrice)) return 'Price not available';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="px-3 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-700 md:w-6 md:h-6" />
            </button>

            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <Home size={28} className="text-purple-600 md:w-8 md:h-8" strokeWidth={2} />
            </div>

            <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search favourites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 md:py-2.5 text-sm md:text-base border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
              />
            </form>

            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter size={20} className="text-gray-700 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-4 md:py-6">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Heart className="w-8 h-8 md:w-10 md:h-10 fill-white" />
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">My Favourites</h1>
            <p className="text-sm md:text-base text-red-100 mt-1">
              {loading ? 'Loading...' : `${properties.length} saved properties`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 pb-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading favourites...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">{error}</p>
            <button 
              onClick={loadFavourites}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <HeartOff size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-2">No favourites yet</h2>
            <p className="text-gray-500 mb-6">Start saving properties you love!</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all shadow-md"
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {properties.map((property) => (
              <div 
                key={property.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="relative h-48 md:h-56 overflow-hidden cursor-pointer" onClick={() => handlePropertyClick(property.id)}>
                  <img 
                    src={property.images && property.images.length > 0 && property.images[0].url 
                      ? property.images[0].url 
                      : 'https://via.placeholder.com/400x300?text=No+Image'} 
                    alt={property.apartment_name || 'Property'}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    }}
                  />
                  {property.property_for && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      For {property.property_for}
                    </div>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavourite(property.id);
                    }}
                    className="absolute top-2 right-2 bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
                  >
                    <Heart 
                      size={20} 
                      className="fill-red-500 text-red-500"
                    />
                  </button>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <div className="mb-2">
                    <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-1 line-clamp-2">
                      {property.bhk_type || 'N/A'} {property.apartment_type || 'Property'} 
                      {property.apartment_name && ` in ${property.apartment_name}`}
                    </h3>
                    <p className="text-xl md:text-2xl font-bold text-purple-600">
                      {formatPrice(property.expected_price)}
                      {property.property_for === 'Rent/Lease' && property.expected_price && (
                        <span className="text-sm text-gray-500">/month</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin size={16} className="mr-1 flex-shrink-0" />
                    <span className="text-sm md:text-base line-clamp-1">
                      {property.locality || 'Location'}, {property.city || 'City'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 md:gap-4 mb-3 text-gray-700 flex-wrap">
                    {property.bhk_type && property.bhk_type.split(' ')[0] !== 'Studio' && (
                      <div className="flex items-center gap-1">
                        <Bed size={18} className="md:w-5 md:h-5" />
                        <span className="text-sm md:text-base">{property.bhk_type.split(' ')[0]}</span>
                      </div>
                    )}
                    {property.bathrooms !== undefined && property.bathrooms > 0 && (
                      <div className="flex items-center gap-1">
                        <Bath size={18} className="md:w-5 md:h-5" />
                        <span className="text-sm md:text-base">{property.bathrooms}</span>
                      </div>
                    )}
                    {property.carpet_area && property.carpet_area > 0 && (
                      <div className="flex items-center gap-1">
                        <Square size={18} className="md:w-5 md:h-5" />
                        <span className="text-sm md:text-base">{property.carpet_area} sqft</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs md:text-sm text-gray-500 mb-3 pb-3 border-b">
                    <span>By: <span className="font-semibold text-gray-700">{property.user_type || 'N/A'}</span></span>
                    <span>{property.created_at ? new Date(property.created_at).toLocaleDateString('en-IN') : 'N/A'}</span>
                  </div>

                  <div className="mt-auto">
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => handlePropertyClick(property.id)}
                        className="col-span-2 py-2 md:py-2.5 px-3 rounded-lg text-white font-semibold text-sm md:text-base transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#7C01A2' }}
                      >
                        <Eye size={16} className="md:w-5 md:h-5" />
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">View</span>
                      </button>

                      <button className="py-2 md:py-2.5 px-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-sm md:text-base transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-1">
                        <Phone size={16} className="md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
