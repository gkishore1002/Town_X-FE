import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, Bed, Bath, Square, Heart, Phone, RotateCcw, SlidersHorizontal, ChevronRight, ChevronLeft, Home } from 'lucide-react';
import TinderCard from 'react-tinder-card';
import { propertyAPI } from '../services/api';

const APP_LOGO_SRC = "/logo.png";
const APP_NAME = "Town Exchange";

export default function PropertyFeed() {
  const location = useLocation();
  const navigate = useNavigate();
  const [category, setCategory] = useState('All Properties');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [swipedCards, setSwipedCards] = useState([]);
  const [showComingSoon, setShowComingSoon] = useState(false);
  
  const currentIndexRef = useRef(currentIndex);
  const childRefs = useMemo(
    () =>
      Array(properties.length)
        .fill(0)
        .map(() => React.createRef()),
    [properties.length]
  );
  
  const [sortBy, setSortBy] = useState('recent');
  const [filters, setFilters] = useState({
    bhkType: '',
    minPrice: '',
    maxPrice: '',
    propertyFor: '',
    furnishing: '',
    parking: false,
    amenities: []
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (location.state?.category) {
      setCategory(location.state.category);
    }
  }, [location]);

  useEffect(() => {
    fetchProperties();
  }, [category, sortBy, filters]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      
      if (category !== 'All Properties') {
        params.category = category;
      }

      if (filters.minPrice) params.min_price = parseFloat(filters.minPrice);
      if (filters.maxPrice) params.max_price = parseFloat(filters.maxPrice);
      if (filters.bhkType) params.bhk_type = filters.bhkType;
      if (filters.propertyFor) params.property_for = filters.propertyFor;
      if (filters.furnishing) params.furnishing_status = filters.furnishing;

      const data = await propertyAPI.getProperties(params);
      
      let filteredData = [...data];
      
      if (sortBy === 'price_low') {
        filteredData.sort((a, b) => a.expected_price - b.expected_price);
      } else if (sortBy === 'price_high') {
        filteredData.sort((a, b) => b.expected_price - a.expected_price);
      } else if (sortBy === 'recent') {
        filteredData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      if (filters.parking) {
        filteredData = filteredData.filter(p => p.parking > 0);
      }

      setProperties(filteredData);
      setCurrentIndex(filteredData.length - 1);
      setSwipedCards([]);
    } catch (err) {
      setError('Failed to load properties');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchProperties();
      return;
    }

    setLoading(true);
    try {
      const results = await propertyAPI.searchProperties(searchQuery);
      setProperties(results);
      setCurrentIndex(results.length - 1);
      setSwipedCards([]);
    } catch (err) {
      setError('Search failed');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProperty = async (propertyId, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    try {
      const result = await propertyAPI.toggleFavourite(propertyId);
      setProperties(prevProperties =>
        prevProperties.map(property =>
          property.id === propertyId
            ? { ...property, is_favourite: result.is_favourite }
            : property
        )
      );
    } catch (err) {
      console.error('Error toggling favourite:', err);
      alert('Failed to update favourite. Please try again.');
    }
  };

  const handlePropertyClick = (propertyId, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    console.log('Navigating to property:', propertyId);
    navigate(`/property/${propertyId}`);
  };

  const handleCallClick = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 2000);
  };

  const handleImageClick = (propertyId, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    console.log('Image clicked, navigating to property:', propertyId);
    navigate(`/property/${propertyId}`);
  };

  const applyFilters = () => {
    setShowFilterModal(false);
    fetchProperties();
  };

  const clearFilters = () => {
    setFilters({
      bhkType: '',
      minPrice: '',
      maxPrice: '',
      propertyFor: '',
      furnishing: '',
      parking: false,
      amenities: []
    });
    setSortBy('recent');
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

  const onCardLeftScreen = (direction, property, index) => {
    console.log(property.id + ' left the screen to ' + direction);
    setSwipedCards(prev => [...prev, { property, index, direction }]);
    setCurrentIndex(prev => prev - 1);
  };

  const resetCards = () => {
    setCurrentIndex(properties.length - 1);
    setSwipedCards([]);
  };

  const goBack = async () => {
    if (swipedCards.length === 0) return;
    
    const lastSwiped = swipedCards[swipedCards.length - 1];
    const newIndex = lastSwiped.index;
    
    setCurrentIndex(newIndex);
    setSwipedCards(prev => prev.slice(0, -1));
    
    if (childRefs[newIndex] && childRefs[newIndex].current) {
      await childRefs[newIndex].current.restoreCard();
    }
  };

  const PropertyCard = ({ property, isSwipeable = false }) => (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md overflow-hidden flex flex-col transition-shadow duration-200 ${
        isSwipeable ? 'h-[calc(100vh-340px)] max-h-[520px]' : ''
      }`}
    >
      <div
        className={`relative overflow-hidden ${
          isSwipeable ? 'h-2/5' : 'h-36 sm:h-40 md:h-44'
        }`}
      >
        <div 
          className="w-full h-full cursor-pointer"
          onClick={(e) => handleImageClick(property.id, e)}
          onTouchEnd={(e) => {
            e.stopPropagation();
          }}
        >
          <img
            src={property.images && property.images.length > 0 && property.images[0].url
              ? property.images[0].url
              : 'https://via.placeholder.com/400x300?text=No+Image'}
            alt={property.apartment_name || 'Property'}
            className="w-full h-full object-cover pointer-events-none"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
            }}
          />
        </div>
        {property.property_for && (
          <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded font-medium shadow-sm pointer-events-none">
            For {property.property_for}
          </div>
        )}
        <button
          onClick={(e) => handleSaveProperty(property.id, e)}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleSaveProperty(property.id, e);
          }}
          className="absolute top-2 right-2 bg-white p-1.5 rounded-full hover:bg-gray-50 transition-colors shadow-sm z-10"
        >
          <Heart
            size={16}
            className={property.is_favourite ? 'fill-red-500 text-red-500' : 'text-gray-600'}
          />
        </button>
      </div>

      <div className={`p-3 flex flex-col flex-grow ${isSwipeable ? 'overflow-y-auto' : ''}`}>
        <div className="mb-2">
          <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2 leading-tight">
            {property.bhk_type || 'N/A'} {property.apartment_type || 'Property'}
            {property.apartment_name && ` in ${property.apartment_name}`}
          </h3>
          <p className="text-lg font-bold text-purple-600">
            {formatPrice(property.expected_price)}
            {property.property_for === 'Rent/Lease' && property.expected_price && (
              <span className="text-xs text-gray-500 font-normal">/month</span>
            )}
          </p>
        </div>

        <div className="flex items-center text-gray-600 mb-2">
          <MapPin size={12} className="mr-1 flex-shrink-0 text-gray-400" />
          <span className="text-xs line-clamp-1">
            {property.locality || 'Location'}, {property.city || 'City'}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-2 text-gray-600 flex-wrap">
          {property.bhk_type && property.bhk_type.split(' ')[0] !== 'Studio' && (
            <div className="flex items-center gap-1">
              <Bed size={14} className="text-gray-400" />
              <span className="text-xs">{property.bhk_type.split(' ')[0]}</span>
            </div>
          )}
          {property.bathrooms !== undefined && property.bathrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bath size={14} className="text-gray-400" />
              <span className="text-xs">{property.bathrooms}</span>
            </div>
          )}
          {property.carpet_area && property.carpet_area > 0 && (
            <div className="flex items-center gap-1">
              <Square size={14} className="text-gray-400" />
              <span className="text-xs">{property.carpet_area} sqft</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-gray-500 mb-2 pb-2 border-t pt-2">
          <span>By: <span className="font-medium text-gray-700">{property.user_type || 'N/A'}</span></span>
          <span>{property.created_at ? new Date(property.created_at).toLocaleDateString('en-IN') : 'N/A'}</span>
        </div>

        <div className="mt-auto">
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={(e) => handlePropertyClick(property.id, e)}
              onTouchEnd={(e) => {
                e.preventDefault();
                handlePropertyClick(property.id, e);
              }}
              className="col-span-2 py-1.5 px-2 rounded-lg text-white font-medium text-xs transition-colors flex items-center justify-center gap-1 z-10"
              style={{ backgroundColor: '#7C01A2' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5D1578'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#7C01A2'}
            >
              <span>View Details</span>
            </button>

            <button 
              onClick={(e) => handleCallClick(e)}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleCallClick(e);
              }}
              className="py-1.5 px-2 rounded-lg border border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-medium text-xs transition-colors flex items-center justify-center z-10"
            >
              <Phone size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const hasActiveFilters = filters.bhkType || filters.minPrice || filters.maxPrice || filters.propertyFor || filters.furnishing || filters.parking;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-3 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={24} className="text-gray-700" />
              </button>

              <button className="flex items-center gap-2.5 hover:opacity-85 transition-opacity" onClick={() => navigate('/')}>
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
                    Property Marketplace
                  </span>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg font-medium">
                {loading ? 'Loading...' : `${properties.length} Properties`}
              </span>
            </div>
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
            <span className="text-purple-600 font-semibold">{category}</span>
          </nav>
        </div>
      </div>

      {/* Combined Search and Filter Section */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] md:top-[85px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Search and Filter Row */}
          <div className="flex gap-3 mb-3">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by location, property type, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </form>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilterModal(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${
                hasActiveFilters 
                  ? 'bg-purple-50 text-purple-700 border-purple-300 shadow-sm' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal size={18} />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600"></span>
                </span>
              )}
            </button>
          </div>

          {/* Sort Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-sm text-gray-600 font-medium whitespace-nowrap mr-1">Sort by:</span>
            
            <button
              onClick={() => setSortBy('recent')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                sortBy === 'recent' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy('price_low')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                sortBy === 'price_low' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Price: Low to High
            </button>
            <button
              onClick={() => setSortBy('price_high')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                sortBy === 'price_high' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Price: High to Low
            </button>
          </div>
        </div>
      </div>

      {/* Properties Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4 text-sm">Loading properties...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 text-base font-medium">{error}</p>
            <button
              onClick={fetchProperties}
              className="mt-4 px-6 py-2.5 text-white rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all"
              style={{ backgroundColor: '#7C01A2' }}
            >
              Try Again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-base font-medium">No properties found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search criteria</p>
          </div>
        ) : isMobile ? (
          /* Mobile: Tinder Card View */
          <div className="relative">
            {currentIndex < 0 ? (
              /* No More Cards Screen */
              <div className="flex flex-col items-center justify-center h-[calc(100vh-340px)] max-h-[520px]">
                <div className="text-center p-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-purple-50 rounded-full flex items-center justify-center">
                    <img
                      src={APP_LOGO_SRC}
                      alt={APP_NAME}
                      className="w-12 h-12 rounded-full object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No More Properties
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    You've viewed all available properties
                  </p>
                  <button
                    onClick={resetCards}
                    className="px-6 py-2.5 rounded-lg text-white font-medium text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mx-auto"
                    style={{ backgroundColor: '#7C01A2' }}
                  >
                    <RotateCcw size={18} />
                    <span>View Again</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative h-[calc(100vh-340px)] max-h-[520px] flex items-center justify-center">
                  {properties.map((property, index) => (
                    <TinderCard
                      ref={childRefs[index]}
                      key={property.id}
                      onCardLeftScreen={(dir) => onCardLeftScreen(dir, property, index)}
                      preventSwipe={['up', 'down']}
                      className="absolute w-full max-w-md"
                      flickOnSwipe={true}
                      swipeRequirementType="position"
                      swipeThreshold={100}
                    >
                      <div style={{ 
                        display: index <= currentIndex && index > currentIndex - 3 ? 'block' : 'none',
                        transform: index < currentIndex ? `scale(${1 - (currentIndex - index) * 0.05})` : 'scale(1)',
                        opacity: index < currentIndex ? 1 - (currentIndex - index) * 0.3 : 1
                      }}>
                        <PropertyCard property={property} isSwipeable={true} />
                      </div>
                    </TinderCard>
                  ))}
                </div>

                {/* Card Counter */}
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600 font-medium">
                    {currentIndex >= 0 ? properties.length - currentIndex : 0} of {properties.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Swipe left or right to explore</p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={goBack}
                    disabled={swipedCards.length === 0}
                    className={`w-12 h-12 rounded-full bg-white border border-gray-300 shadow-md flex items-center justify-center transition-all ${
                      swipedCards.length === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50 hover:shadow-lg'
                    }`}
                  >
                    <RotateCcw size={20} className="text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentIndex >= 0) handleSaveProperty(properties[currentIndex].id);
                    }}
                    className="w-14 h-14 rounded-full bg-white border border-gray-300 shadow-md flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all"
                    disabled={currentIndex < 0}
                  >
                    <Heart size={24} className="text-red-500" />
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Desktop: Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} isSwipeable={false} />
            ))}
          </div>
        )}
      </div>

      {/* Coming Soon Toast */}
      {showComingSoon && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[9999]">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl">
            <p className="text-sm font-medium">📞 Call feature coming soon!</p>
          </div>
        </div>
      )}

      {/* Filter Modal with Custom Close Icon */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-end md:items-center justify-center backdrop-blur-sm">
          <div className="bg-white w-full md:w-[520px] md:rounded-xl rounded-t-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Filter Properties</h2>
              <button 
                onClick={() => setShowFilterModal(false)} 
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <img 
                  src="/red-cross.svg" 
                  alt="Close" 
                  className="w-5 h-5"
                />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">BHK Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK', 'Studio'].map((bhk) => (
                    <button
                      key={bhk}
                      onClick={() => setFilters(prev => ({ ...prev, bhkType: prev.bhkType === bhk ? '' : bhk }))}
                      className={`py-2 px-3 rounded-lg text-xs font-medium transition-all border ${
                        filters.bhkType === bhk ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {bhk}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property For</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Sell', 'Rent/Lease'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilters(prev => ({ ...prev, propertyFor: prev.propertyFor === type ? '' : type }))}
                      className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all border ${
                        filters.propertyFor === type ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (₹)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Furnished', 'Semi-Furnished', 'Unfurnished'].map((furnish) => (
                    <button
                      key={furnish}
                      onClick={() => setFilters(prev => ({ ...prev, furnishing: prev.furnishing === furnish ? '' : furnish }))}
                      className={`py-2 px-2 rounded-lg text-xs font-medium transition-all border ${
                        filters.furnishing === furnish ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {furnish}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Features</label>
                <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200">
                  <input
                    type="checkbox"
                    checked={filters.parking}
                    onChange={(e) => setFilters(prev => ({ ...prev, parking: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Parking Available</span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-5 py-4 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 py-2.5 px-4 rounded-lg text-white font-medium text-sm transition-colors"
                style={{ backgroundColor: '#7C01A2' }}
              >
                Apply Filters
              </button>
            </div>
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
