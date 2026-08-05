import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  MapPin,
  Plus,
  Home,
  AlertCircle,
  Heart,
  Camera,
  Building2,
  LogOut,
  Users2,
} from "lucide-react";
import axios from "axios";
import { propertyAPI } from "../services/api";
import { configAPI } from "../services/configAPI";
import { DynamicIcon } from "./DynamicIcon";
import StoryUploadModal from "./StoryUploadModal";
import CreatePostModal from "./CreatePostModal";
import { useAuth, ROLE_HOME_ROUTE } from "../context/AuthContext";
import { useLogout } from "@/context/AuthDrawerContext";
import { FooterLinks } from "@/components/legal/FooterLinks";
import { TownExchangeLogo, APP_NAME } from "@/components/brand/TownExchangeLogo";
import TownLoader from "@/components/shared/TownLoader";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8005";

const APP_LOCATION = "Chennai, India";

const colorClasses = {
  purple: { bg: "bg-brand-50", text: "text-brand-700", hover: "hover:bg-brand-100" },
  blue: { bg: "bg-blue-50", text: "text-blue-700", hover: "hover:bg-blue-100" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", hover: "hover:bg-orange-100" },
  green: { bg: "bg-emerald-50", text: "text-emerald-700", hover: "hover:bg-emerald-100" },
  red: { bg: "bg-rose-50", text: "text-rose-700", hover: "hover:bg-rose-100" },
};

const SEARCH_TABS = [
  { key: "rent", label: "For Rent", propertyFor: "Rent/Lease", category: "Rent/Lease" },
  { key: "sale", label: "For Sale", propertyFor: "Sell", category: "Buy Land/Homes" },
  { key: "commercial", label: "Commercial", propertyType: "Commercial" },
];

const QUICK_ACTIONS = [
  { icon: Building2, label: "Browse", action: "feed" },
  { icon: Heart, label: "Favourites", action: "favourites" },
  { icon: Camera, label: "Stories", action: "stories" },
  { icon: Plus, label: "Post", action: "post" },
];

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const logoutToHome = useLogout();

  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState(null);

  const [activeSearchTab, setActiveSearchTab] = useState(SEARCH_TABS[0].key);
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
      console.error("Error loading stories:", error);
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
        navigate(`/property/${propertyId}`);
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

  const handleTabSearch = useCallback(() => {
    const trimmed = searchQuery.trim();
    const tab = SEARCH_TABS.find((t) => t.key === activeSearchTab);
    if (trimmed.length >= 2) {
      navigate("/property-feed", { state: { query: trimmed } });
      return;
    }
    navigate("/property-feed", {
      state: {
        category: tab.category,
        propertyFor: tab.propertyFor,
        propertyType: tab.propertyType,
      },
    });
  }, [navigate, searchQuery, activeSearchTab]);

  const handleQuickAction = useCallback(
    (action) => {
      switch (action) {
        case "feed":
          navigate("/property-feed");
          break;
        case "favourites":
          navigate("/favourites");
          break;
        case "stories":
          document.getElementById("stories-section")?.scrollIntoView({ behavior: "smooth" });
          break;
        case "post":
          handleCreatePost();
          break;
        default:
          break;
      }
    },
    [navigate, handleCreatePost]
  );

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

  const firstName = user?.name?.split(" ")[0];

  if (configLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <TownLoader size="lg" label="Loading home" minHeight="100vh" />
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
            className="px-6 py-2.5 text-sm font-medium rounded-control text-white bg-brand-500 hover:bg-brand-700 shadow-soft-md transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
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

      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-soft-sm safe-top">
        <div className="px-4 py-3 max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <button
              onClick={() => navigate("/home")}
              className="flex min-w-0 flex-1 items-center gap-2 hover:opacity-85 transition-opacity sm:gap-2.5 sm:flex-none"
            >
              <TownExchangeLogo size={36} className="rounded-full bg-white shadow-soft-sm border border-gray-200" />
              <div className="min-w-0 flex flex-col">
                <span className="font-display text-sm sm:text-base font-semibold text-gray-900 leading-tight truncate">
                  {APP_NAME}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  {APP_LOCATION}
                </span>
              </div>
            </button>

            <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 flex-shrink-0">
              {user?.role === "buyer" && (
                <button
                  onClick={() => navigate("/favourites")}
                  title="Favourites"
                  className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-control text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">Favourites</span>
                </button>
              )}
              {user?.role !== "buyer" && (
                <button
                  onClick={() => navigate(ROLE_HOME_ROUTE[user.role])}
                  title="Dashboard"
                  className="inline-flex items-center p-2 sm:px-3 sm:py-2 rounded-control text-sm font-medium text-brand-700 hover:bg-brand-50 transition-colors"
                >
                  <span className="hidden sm:inline">Dashboard</span>
                  <Building2 className="w-4 h-4 sm:hidden" />
                </button>
              )}
              <button
                onClick={logoutToHome}
                title="Log out"
                className="p-2 rounded-control text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleCreatePost}
                className="px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-control font-medium text-sm flex items-center gap-1.5 text-white bg-brand-500 hover:bg-brand-700 shadow-soft-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{config.header.postButton.text || "Post Property"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-gray-900">
            {firstName ? `Hi ${firstName}` : "Find a property"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Search listings in Chennai</p>
        </div>

        <div
          ref={searchRef}
          className="bg-white rounded-card border border-gray-200 shadow-soft-sm overflow-visible"
        >
          <div className="flex border-b border-gray-100">
            {SEARCH_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSearchTab(tab.key)}
                className={`flex-1 px-3 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeSearchTab === tab.key
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 min-w-0">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Locality, e.g. Anna Nagar, Velachery..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTabSearch()}
                  className="w-full pl-11 pr-10 py-3 text-sm bg-gray-50 border border-gray-200 rounded-control focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
                {searching && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <TownLoader size="xs" />
                  </div>
                )}

                {showDropdown && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-card shadow-soft-lg max-h-80 overflow-y-auto z-50">
                    {searching ? (
                      <div className="p-4 text-center">
                        <TownLoader size="sm" label="Searching" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {searchResults.map((property) => (
                          <button
                            key={property.id}
                            onClick={() => handlePropertyClick(property.id)}
                            className="w-full px-3 py-3 hover:bg-brand-50/70 text-left transition-colors"
                          >
                            <div className="flex gap-3">
                              {property.images?.[0] ? (
                                <img
                                  src={property.images[0].url}
                                  alt=""
                                  className="w-14 h-14 rounded-control object-cover flex-shrink-0"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-control bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <Home className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900 truncate">
                                  {property.bhk_type} {property.apartment_type}
                                  {property.apartment_name && ` in ${property.apartment_name}`}
                                </p>
                                <p className="text-xs text-gray-500 truncate mt-1">
                                  {property.locality}, {property.city}
                                </p>
                                <p className="text-sm font-semibold text-brand-700 mt-1">
                                  {formatPrice(property.expected_price)}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-sm text-gray-600">
                        No properties found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleTabSearch}
                className="px-6 py-3 rounded-control text-sm font-semibold flex items-center justify-center gap-2 text-white bg-brand-500 hover:bg-brand-700 transition-colors shrink-0"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((item) => (
            <button
              key={item.label}
              onClick={() => handleQuickAction(item.action)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-card bg-white border border-gray-100 hover:border-brand-200 hover:bg-brand-50/30 transition-colors"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-50 text-brand-600">
                <item.icon className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-medium text-gray-700">{item.label}</span>
            </button>
          ))}
        </div>

        {config.featuredSection?.enabled && (
          <section id="stories-section">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">
                {config.featuredSection.title}
              </h2>
              {stories.length > 0 && (
                <span className="text-xs font-medium text-brand-700 px-2 py-0.5 bg-brand-50 rounded-full">
                  {stories.length}
                </span>
              )}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-1 snap-x scrollbar-hide">
              <button
                onClick={() => setShowStoryModal(true)}
                className="flex-shrink-0 snap-start w-20 h-28 sm:w-24 sm:h-32 rounded-card bg-white border-2 border-dashed border-brand-200 hover:border-brand-500 flex flex-col items-center justify-center gap-2 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center">
                  <Plus className="text-white w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-gray-700">Create</span>
              </button>

              {storiesLoading &&
                stories.length === 0 &&
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="flex-shrink-0 w-20 h-28 sm:w-24 sm:h-32 rounded-card bg-gray-200 animate-pulse"
                  />
                ))}

              {stories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => handleStoryClick(story)}
                  className="flex-shrink-0 snap-start w-20 h-28 sm:w-24 sm:h-32 rounded-card overflow-hidden relative border-2 border-brand-500"
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
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            {config.categories.title}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {config.categories.items.map((category) => {
              const colors = colorClasses[category.color] || colorClasses.purple;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`rounded-card bg-white border border-gray-100 hover:border-brand-300 px-3 py-4 shadow-soft-sm transition-colors w-full ${colors.hover}`}
                >
                  <div className="text-center">
                    <div className={`w-11 h-11 rounded-full ${colors.bg} flex items-center justify-center mx-auto mb-2`}>
                      <DynamicIcon name={category.icon} size={20} className={colors.text} strokeWidth={2} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{category.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {config.favouritesSection?.enabled && user?.role === "buyer" && (
          <button
            onClick={handleViewFavourites}
            className="w-full rounded-card bg-white border border-rose-200 hover:border-rose-300 px-4 py-4 flex items-center gap-3 transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-rose-500 flex items-center justify-center shrink-0">
              <DynamicIcon name={config.favouritesSection.icon || "Heart"} size={20} className="text-white" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {config.favouritesSection.title}
              </p>
              <p className="text-xs text-rose-700 truncate">
                {config.favouritesSection.subtitle}
              </p>
            </div>
          </button>
        )}
      </main>

      <footer className="mt-8 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TownExchangeLogo size={28} />
              <span className="font-display text-sm font-semibold text-gray-800">{APP_NAME}</span>
            </div>
            <FooterLinks />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <Users2 className="w-3.5 h-3.5" />
            <span>&copy; {new Date().getFullYear()} {APP_NAME}</span>
          </div>
        </div>
      </footer>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
