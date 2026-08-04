import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, ArrowLeft, Heart, Filter, HeartOff } from 'lucide-react';
import { propertyAPI } from '../services/api';
import { PropertyCard } from './PropertyCard';
import { getApiErrorMessage } from '@/lib/apiErrors';
import LoadErrorState from "@/components/shared/LoadErrorState";
import TownLoader from "@/components/shared/TownLoader";

export default function Favourites() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [errorCause, setErrorCause] = useState(null);

  useEffect(() => {
    loadFavourites();
  }, []);

  const loadFavourites = async () => {
    setLoading(true);
    setError(null);
    setErrorCause(null);

    try {
      const favourites = await propertyAPI.getFavourites();
      setProperties(favourites);
    } catch (err) {
      console.error('Error loading favourites:', err);
      setError(getApiErrorMessage(err, 'Could not load favourites. Please try again.'));
      setErrorCause(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
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

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <header className="bg-white shadow-soft-sm sticky top-0 z-50 safe-top">
        <div className="px-3 py-3 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft size={22} className="text-gray-700 sm:w-6 sm:h-6" />
            </button>

            <div className="flex items-center cursor-pointer flex-shrink-0" onClick={() => navigate('/')}>
              <Home size={26} className="text-brand-600 sm:w-8 sm:h-8" strokeWidth={2} />
            </div>

            <form onSubmit={handleSearch} className="relative flex-1 min-w-[140px] basis-[50%] sm:basis-auto sm:max-w-2xl order-3 sm:order-none w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search favourites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 md:py-2.5 text-sm md:text-base border-2 border-gray-200 rounded-control focus:outline-none focus:border-brand-500 transition-colors"
              />
            </form>

            <button type="button" className="hidden sm:block p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0" aria-hidden>
              <Filter size={20} className="text-gray-700" />
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
          <TownLoader size="lg" label="Loading favourites" minHeight="50vh" />
        ) : error ? (
          <LoadErrorState
            title="Couldn't load favourites"
            message={error}
            error={errorCause}
            onRetry={loadFavourites}
          />
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <HeartOff size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-2">No favourites yet</h2>
            <p className="text-gray-500 mb-6">Start saving properties you love!</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-control hover:from-red-600 hover:to-pink-600 transition-all shadow-soft-md"
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onOpenDetails={handlePropertyClick}
                onFavouriteChange={(id, isFav) => {
                  if (!isFav) {
                    setProperties((prev) => prev.filter((p) => p.id !== id));
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
