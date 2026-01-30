import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  MapPin,
  Plus,
  Home,
  Loader2,
  AlertCircle,
  TrendingUp,
  Users,
  Shield,
} from "lucide-react";
import axios from "axios";
import { propertyAPI } from "../services/api";
import { configAPI } from "../services/configAPI";
import { DynamicIcon } from "./DynamicIcon";
import StoryUploadModal from "./StoryUploadModal";
import CreatePostModal from "./CreatePostModal";
import TextType from "../shared/TextType/TextType";
import AnimatedContent from "../shared/Animated Content/AnimatedContent.jsx";
import ElasticSlider from "../shared/Slider/ElasticSlider";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const APP_LOGO_SRC = "/logo.png";
const APP_NAME = "Town Exchange";
const APP_LOCATION = "Chennai, India";
const AMAZON_ORANGE = "#FF9900";

const colorClasses = {
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    hover: "hover:bg-purple-100",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    hover: "hover:bg-blue-100",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    hover: "hover:bg-orange-100",
  },
  green: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    hover: "hover:bg-emerald-100",
  },
  red: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    hover: "hover:bg-rose-100",
  },
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

export default function DynamicLandingPage() {
  const navigate = useNavigate();

  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState(null);

  const [searchRadius, setSearchRadius] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [stories, setStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setConfigLoading(true);
        const data = await configAPI.getLandingConfigCached();
        setConfig(data);
        if (data.searchSection?.defaultRadius) {
          setSearchRadius(data.searchSection.defaultRadius);
        }
        setConfigError(null);
      } catch (error) {
        console.error("Failed to load configuration:", error);
        setConfigError(
          "Failed to load page configuration. Please refresh the page."
        );
      } finally {
        setConfigLoading(false);
      }
    };
    loadConfig();
  }, []);

  const loadStories = useCallback(async () => {
    try {
      setStoriesLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/stories?limit=20`);
      setStories(response.data);
    } catch (error) {
      console.error("❌ Error loading stories:", error);
      setStories([]);
    } finally {
      setStoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProperties = async () => {
      if (debouncedSearchQuery.trim().length >= 2) {
        setSearching(true);
        try {
          const results = await propertyAPI.searchProperties(
            debouncedSearchQuery.trim()
          );
          setSearchResults(results);
          setShowDropdown(true);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    };
    searchProperties();
  }, [debouncedSearchQuery]);

  const handleCreatePost = useCallback(() => {
    setShowCreatePostModal(true);
  }, []);

  const handleCreatePostSuccess = useCallback(
    (propertyId) => {
      setShowCreatePostModal(false);
      if (propertyId) {
        navigate(`/property-details/${propertyId}`);
      }
    },
    [navigate]
  );

  const handleCategoryClick = useCallback(
    (category) => {
      navigate("/property-feed", {
        state: { category: category.categoryFilter },
      });
    },
    [navigate]
  );

  const handleViewFavourites = useCallback(() => {
    navigate(config?.favouritesSection?.actionUrl || "/favourites");
  }, [config, navigate]);

  const handleLocationSearch = useCallback(() => {
    const userLocation = config?.searchSection?.userLocation;
    if (userLocation) {
      navigate("/property-feed", {
        state: {
          searchType: "location",
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: searchRadius,
        },
      });
    }
  }, [config, navigate, searchRadius]);

  const handlePropertyClick = useCallback(
    (propertyId) => {
      setShowDropdown(false);
      setSearchQuery("");
      navigate(`/property/${propertyId}`);
    },
    [navigate]
  );

  const handleStoryClick = useCallback(
    (story) => {
      if (story.id) {
        navigate(`/story/${story.id}`);
      } else if (story.actionUrl) {
        navigate(story.actionUrl);
      }
    },
    [navigate]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
  }, []);

  const handleStorySuccess = useCallback((newStory) => {
    setStories((prev) => [newStory, ...prev]);
    setShowStoryModal(false);
  }, []);

  const formatPrice = useCallback((price) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  if (configLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-purple-700" />
      </div>
    );
  }

  if (configError || !config) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Configuration Error
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {configError || "Failed to load page configuration"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 text-sm font-medium rounded-lg text-black hover:brightness-95 shadow-md"
            style={{ backgroundColor: AMAZON_ORANGE }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onSuccess={handleCreatePostSuccess}
      />

      <StoryUploadModal
        isOpen={showStoryModal}
        onClose={() => setShowStoryModal(false)}
        onSuccess={handleStorySuccess}
      />

      {/* Professional Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-3 max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
            >
              <img
                src={APP_LOGO_SRC}
                alt={APP_NAME}
                className="h-9 w-9 rounded-full object-contain bg-white shadow-sm border border-purple-300"
              />
              <div className="min-w-0 flex flex-col">
                <span className="text-base font-bold text-gray-900 leading-tight tracking-wide" style={{ fontFamily: "'Poppins', 'Montserrat', sans-serif" }}>
                  {APP_NAME}
                </span>
                <span className="flex items-center gap-1 text-xs text-purple-800">
                  <MapPin className="w-3 h-3" />
                  <span>{APP_LOCATION}</span>
                </span>
              </div>
            </button>

            <button
              onClick={handleCreatePost}
              className="px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-1.5 flex-shrink-0 text-black shadow-md hover:shadow-lg border border-black/5 transition-all"
              style={{ backgroundColor: AMAZON_ORANGE }}
            >
              <Plus className="w-4 h-4" />
              <span>{config.header.postButton.text || "Add Post"}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-900 to-indigo-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_60%)] opacity-70" />

          <div className="relative px-4 py-8 md:py-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 blur-xl bg-purple-700/50 rounded-full" />
                    <img
                      src={APP_LOGO_SRC}
                      alt={APP_NAME}
                      className="relative h-20 w-20 md:h-24 md:w-24 rounded-full object-contain bg-white shadow-xl border-2 border-purple-200"
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <TextType
                    as="h2"
                    text={[
                      "Premium homes, local to Chennai.",
                      "Curated properties for serious buyers.",
                      "Smarter discovery for owners & agents.",
                    ]}
                    typingSpeed={65}
                    deletingSpeed={30}
                    pauseDuration={1500}
                    loop={true}
                    showCursor={true}
                    cursorCharacter="|"
                    className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-snug"
                    textColors={["#ffffff"]}
                    startOnVisible={true}
                    variableSpeed={{ min: 50, max: 80 }}
                  />

                  <p className="mt-2 text-sm md:text-base text-purple-100/90 leading-relaxed">
                    Discover vetted listings from owners and trusted agents with
                    rich photos, pricing clarity, and neighbourhood insights
                    tailored to Chennai.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs md:text-sm">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-purple-800/70 text-purple-50 border border-purple-500/50 shadow-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>10K+ active listings</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-purple-800/70 text-purple-50 border border-purple-500/50 shadow-sm">
                  <Users className="w-4 h-4" />
                  <span>5K+ verified users</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-purple-800/70 text-purple-50 border border-purple-500/50 shadow-sm">
                  <Shield className="w-4 h-4" />
                  <span>Owner & agent verified</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Search Section with ElasticSlider */}
        {config.searchSection?.enabled && (
          <section className="-mt-4 px-4 py-4 relative z-10">
            <div
              ref={searchRef}
              className="bg-white/95 backdrop-blur-sm rounded-xl border border-purple-200 shadow-lg shadow-purple-100/60 px-4 py-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
                <div className="relative flex-1 min-w-0">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder={config.searchSection.placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 text-sm bg-gray-50 border border-purple-200 rounded-lg focus:outline-none focus:border-purple-700 focus:ring-2 focus:ring-purple-200 shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                  {searching && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      <Loader2 className="animate-spin h-4 w-4 text-purple-700" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-gray-50 border border-purple-200 rounded-lg px-3 py-2 w-full lg:w-80 shadow-inner">
                    <ElasticSlider
                      leftIcon={<MapPin size={18} className="text-purple-600" />}
                      rightIcon={
                        <span 
                          className="text-sm font-bold whitespace-nowrap"
                          style={{ color: AMAZON_ORANGE }}
                        >
                          {searchRadius} km
                        </span>
                      }
                      startingValue={1}
                      defaultValue={searchRadius}
                      maxValue={config.searchSection.maxRadius || 50}
                      isStepped
                      stepSize={1}
                      onChange={(value) => setSearchRadius(value)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleLocationSearch}
                    className="px-5 py-3 rounded-lg text-sm font-medium flex items-center gap-2 text-black shadow-md hover:shadow-lg border border-black/5 transition-all whitespace-nowrap"
                    style={{ backgroundColor: AMAZON_ORANGE }}
                  >
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {showDropdown && (
                <div className="mt-3 bg-white border border-purple-200 rounded-lg shadow-lg shadow-purple-100 max-h-80 overflow-y-auto z-50">
                  {searching ? (
                    <div className="p-4 text-center">
                      <Loader2 className="animate-spin h-6 w-6 text-purple-700 mx-auto" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {searchResults.map((property) => (
                        <button
                          key={property.id}
                          onClick={() => handlePropertyClick(property.id)}
                          className="w-full px-3 py-3 hover:bg-gray-50 text-left transition-colors"
                        >
                          <div className="flex gap-3">
                            {property.images?.[0] ? (
                              <img
                                src={property.images[0].url}
                                alt=""
                                className="w-14 h-14 rounded-lg object-cover flex-shrink-0 shadow-sm"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 border border-dashed border-gray-200">
                                <Home className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 truncate">
                                {property.bhk_type} {property.apartment_type}
                                {property.apartment_name &&
                                  ` in ${property.apartment_name}`}
                              </p>
                              <p className="text-xs text-gray-500 truncate mt-1 flex items-center gap-1">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                {property.locality}, {property.city}
                              </p>
                              <p className="text-sm font-semibold text-purple-800 mt-1">
                                {formatPrice(property.expected_price)}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        No properties found
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Stories Section */}
        {config.featuredSection?.enabled && (
          <section className="px-4 py-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                {config.featuredSection.title}
              </h2>
              {stories.length > 0 && (
                <span className="text-xs font-medium text-purple-800 px-2.5 py-1 bg-purple-50 rounded-full border border-purple-200 shadow-sm">
                  {stories.length}
                </span>
              )}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-hide">
              <button
                onClick={() => setShowStoryModal(true)}
                className="flex-shrink-0 snap-start w-24 h-32 rounded-xl bg-gray-50 border-2 border-dashed border-purple-200 hover:border-purple-600 flex flex-col items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                  style={{ backgroundColor: AMAZON_ORANGE }}
                >
                  <Plus className="text-black w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-gray-700">
                  Create
                </span>
              </button>

              {stories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => handleStoryClick(story)}
                  className="flex-shrink-0 snap-start w-24 h-32 rounded-xl overflow-hidden relative group border border-purple-50 shadow-md hover:shadow-lg transition-shadow"
                >
                  {story.media_type === "video" ? (
                    <video
                      src={story.media_url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={story.media_url}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 rounded-xl ring-2 ring-purple-600 ring-offset-1 ring-offset-white" />
                  {story.media_type === "video" && (
                    <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[5px] border-l-white border-b-[3px] border-b-transparent ml-0.5" />
                    </div>
                  )}
                </button>
              ))}

              {config.featuredSection.stories.map((story) => (
                <button
                  key={`cfg-${story.id}`}
                  onClick={() => handleStoryClick(story)}
                  className={`flex-shrink-0 snap-start w-24 h-32 rounded-xl bg-gradient-to-br ${story.gradient} relative p-2 border border-purple-100/60 shadow-md hover:shadow-lg transition-shadow`}
                >
                  <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-base text-purple-800 shadow-sm">
                    {story.emoji}
                  </div>
                  <p className="absolute bottom-1.5 left-1.5 right-1.5 text-white text-xs font-semibold drop-shadow leading-tight">
                    {story.title}
                  </p>
                </button>
              ))}

              {storiesLoading && (
                <div className="flex-shrink-0 w-24 h-32 rounded-xl bg-gray-100 flex items-center justify-center shadow-inner">
                  <Loader2 className="animate-spin h-5 w-5 text-purple-700" />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Categories Section - Fixed Mobile Layout */}
        <section className="px-4 py-5">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3">
            {config.categories.title}
          </h2>

          {/* Mobile: Simple Grid Without Animation */}
          <div className="grid grid-cols-2 sm:hidden gap-3">
            {config.categories.items.map((category) => {
              const colors =
                colorClasses[category.color] || colorClasses.purple;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`relative rounded-xl bg-white border border-purple-100 hover:border-purple-400 transition-all duration-200 px-4 py-4 shadow-sm hover:shadow-md active:scale-95 w-full ${colors.hover}`}
                >
                  <div className="text-center">
                    <div
                      className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center mx-auto mb-2 shadow-sm border border-white/70`}
                    >
                      <DynamicIcon
                        name={category.icon}
                        size={20}
                        className={`${colors.text}`}
                        strokeWidth={2}
                      />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {category.name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tablet & Desktop: With AnimatedContent */}
          <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 gap-3">
            {config.categories.items.map((category, index) => {
              const colors =
                colorClasses[category.color] || colorClasses.purple;
              return (
                <AnimatedContent
                  key={category.id}
                  distance={50}
                  direction="horizontal"
                  reverse={index % 2 === 1}
                  duration={0.6}
                  ease="easeOut"
                  initialOpacity={0}
                  animateOpacity
                  scale={1.03}
                  threshold={0.15}
                  delay={0.04 * index}
                >
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className={`group relative rounded-xl bg-white/95 border border-purple-100/80 hover:border-purple-500/80 transition-all duration-300 px-4 py-4 shadow-sm hover:shadow-lg hover:shadow-purple-100/70 hover:-translate-y-1 active:scale-[0.98] w-full ${colors.hover}`}
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 blur transition-all duration-300 bg-gradient-to-br from-purple-500/15 to-orange-500/15" />
                    <div className="relative z-10 text-center">
                      <div
                        className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center mx-auto mb-2 shadow-md border border-white/70`}
                      >
                        <DynamicIcon
                          name={category.icon}
                          size={22}
                          className={`${colors.text}`}
                          strokeWidth={2.2}
                        />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 leading-tight tracking-tight">
                        {category.name}
                      </p>
                    </div>
                  </button>
                </AnimatedContent>
              );
            })}
          </div>
        </section>

        {/* Favourites Section */}
        {config.favouritesSection?.enabled && (
          <section className="px-4 py-5 pb-8">
            <button
              onClick={handleViewFavourites}
              className="group relative w-full rounded-xl bg-rose-50/90 border border-rose-200/80 hover:border-rose-400/80 hover:bg-rose-100/90 transition-all duration-300 px-4 py-4 shadow-sm hover:shadow-xl hover:shadow-rose-100/70 hover:-translate-y-1 active:scale-[0.98]"
            >
              <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 blur transition-all duration-300 bg-gradient-to-br from-rose-400/20 to-red-400/20" />
              <div className="relative z-10 flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center ring-2 ring-white/60 shadow-md">
                  <DynamicIcon
                    name={config.favouritesSection.icon || "Heart"}
                    size={22}
                    className="text-white"
                  />
                </div>
                <div className="text-left">
                  <p className="text-base font-bold text-gray-900 leading-tight">
                    {config.favouritesSection.title}
                  </p>
                  <p className="text-sm text-rose-700 font-medium">
                    {config.favouritesSection.subtitle}
                  </p>
                </div>
              </div>
            </button>
          </section>
        )}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Montserrat:wght@400;600;700&display=swap');
        
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

