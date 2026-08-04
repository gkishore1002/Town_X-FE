import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  X,
  MapPin,
  Plus,
  Home,
  Loader2,
  AlertCircle,
  Percent,
  Images,
  Heart,
  ShieldCheck,
  Camera,
  Building2,
  UserPlus,
  LogOut,
  ArrowRight,
  Sparkles,
  ClipboardList,
  Users2,
  Key,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import axios from "axios";
import { propertyAPI } from "../services/api";
import { configAPI } from "../services/configAPI";
import { DynamicIcon } from "./DynamicIcon";
import StoryUploadModal from "./StoryUploadModal";
import CreatePostModal from "./CreatePostModal";
import Shuffle from "../shared/Shuffle/Shuffle";
import { useAuth, ROLE_HOME_ROUTE } from "../context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8005";

const APP_LOGO_SRC = "/logo.png";
const APP_NAME = "Town Exchange";
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

// Real Chennai localities — link straight into working /property-feed
// search rather than to hundreds of city landing pages that don't exist.
const CHENNAI_LOCALITIES = [
  "Anna Nagar", "Adyar", "T Nagar", "Velachery", "OMR", "Porur",
  "Nungambakkam", "Mylapore", "Tambaram", "Guindy", "Kilpauk", "Perambur",
];

const WHY_US = [
  { icon: Percent, title: "No Brokerage Fees", description: "Connect with owners directly — no middleman commission." },
  { icon: Images, title: "Rich Photo Galleries", description: "Every listing comes with real, high-quality photos." },
  { icon: Heart, title: "Instant Favourites", description: "Save properties you love and revisit them anytime." },
  { icon: Camera, title: "24-Hour Property Stories", description: "See fresh listings the moment owners post them." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Search & Discover", description: "Browse verified listings by location, price, and BHK — filtered to what actually matters to you." },
  { step: "02", title: "Connect Directly", description: "View rich photos and reach out to the owner directly. No brokers in between." },
  { step: "03", title: "Save & Compare", description: "Favourite the properties you like and shortlist your options." },
  { step: "04", title: "Move In", description: "Finalize the details directly with the property owner." },
];

const QUICK_LINKS = {
  Discover: [
    { label: "Browse Properties", action: "feed" },
    { label: "Saved Favourites", action: "favourites" },
    { label: "Property Stories", action: "stories" },
  ],
  "Get Started": [
    { label: "Post a Property — Free", action: "post" },
    { label: "For Owners & Agents", action: "signup-owner" },
    { label: "Create an Account", action: "signup" },
  ],
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
  const shouldReduceMotion = useReducedMotion();
  const { user, isAuthenticated, logout } = useAuth();

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

  const { data: platformStats } = useQuery({
    queryKey: ["landing-stats"],
    queryFn: () => propertyAPI.getStats(),
  });
  const { data: categoryStats } = useQuery({
    queryKey: ["landing-category-stats"],
    queryFn: () => propertyAPI.getCategoryStats(),
  });

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

  // Tab + "Search" button: navigate using the active tab's real filters, or —
  // if the user typed a locality/keyword — use the free-text search instead
  // (the two can't be combined server-side, so only ever send one).
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

  const handleLocalityClick = useCallback(
    (locality, propertyFor) => {
      navigate("/property-feed", { state: { query: locality, propertyFor } });
    },
    [navigate]
  );

  const handleQuickLink = useCallback(
    (action) => {
      switch (action) {
        case "feed":
          navigate("/property-feed");
          break;
        case "favourites":
          navigate("/favourites");
          break;
        case "stories":
          document.getElementById("stories-section")?.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth" });
          break;
        case "post":
          handleCreatePost();
          break;
        case "signup":
          navigate("/signup");
          break;
        case "signup-owner":
          navigate("/signup", { state: { defaultRole: "owner" } });
          break;
        default:
          break;
      }
    },
    [navigate, shouldReduceMotion, handleCreatePost]
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

  if (configLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-brand-600" />
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

      {/* ==================== HEADER ==================== */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-soft-sm">
        <div className="px-4 py-3 max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
            >
              <img
                src={APP_LOGO_SRC}
                alt={APP_NAME}
                className="h-9 w-9 rounded-full object-contain bg-white shadow-soft-sm border border-gray-200"
              />
              <div className="min-w-0 flex flex-col">
                <span className="font-display text-base font-semibold text-gray-900 leading-tight tracking-wide">
                  {APP_NAME}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>{APP_LOCATION}</span>
                </span>
              </div>
            </button>

            <div className="flex items-center gap-2 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  {user?.role !== "buyer" && (
                    <button
                      onClick={() => navigate(ROLE_HOME_ROUTE[user.role])}
                      className="hidden sm:inline-flex items-center px-3 py-2 rounded-control text-sm font-medium text-brand-700 hover:bg-brand-50 transition-colors"
                    >
                      Dashboard
                    </button>
                  )}
                  <button
                    onClick={logout}
                    title="Log out"
                    className="p-2 rounded-control text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="hidden sm:inline-flex items-center px-3 py-2 rounded-control text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="hidden sm:inline-flex items-center px-3 py-2 rounded-control text-sm font-medium border-2 border-brand-500 text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    Sign up
                  </button>
                </>
              )}

              <button
                onClick={handleCreatePost}
                className="px-4 py-2.5 rounded-control font-medium text-sm flex items-center gap-1.5 text-white bg-brand-500 hover:bg-brand-700 shadow-soft-sm hover:shadow-brand-glow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{config.header.postButton.text || "Post Property FREE"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== HERO + TABBED SEARCH ==================== */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 pt-10 pb-6 text-center">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
            Chennai's No-Brokerage Property Marketplace
          </h1>
          <p className="mt-2 text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Search verified listings, connect directly with owners, and save
            on brokerage — with rich photos and pricing clarity.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-xs md:text-sm">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
              <Percent className="w-3.5 h-3.5" />
              <span>Zero Brokerage</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Direct Owner Contact</span>
            </span>
          </div>
        </div>

        {/* Tabbed search card */}
        <div className="max-w-4xl mx-auto px-4 pb-8">
          <div
            ref={searchRef}
            className="bg-white rounded-card border border-gray-200 shadow-soft-lg overflow-visible"
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
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1 min-w-0">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search locality, e.g. Anna Nagar, Velachery..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleTabSearch()}
                    className="w-full pl-11 pr-10 py-3 text-sm bg-gray-50 border border-gray-200 rounded-control focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
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
                      <Loader2 className="animate-spin h-4 w-4 text-brand-600" />
                    </div>
                  )}

                  {showDropdown && (
                    <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-card shadow-soft-lg max-h-80 overflow-y-auto z-50">
                      {searching ? (
                        <div className="p-4 text-center">
                          <Loader2 className="animate-spin h-6 w-6 text-brand-600 mx-auto" />
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {searchResults.map((property) => (
                            <button
                              key={property.id}
                              onClick={() => handlePropertyClick(property.id)}
                              className="group w-full px-3 py-3 hover:bg-brand-50/70 text-left transition-colors duration-200"
                            >
                              <div className="flex gap-3">
                                {property.images?.[0] ? (
                                  <img
                                    src={property.images[0].url}
                                    alt=""
                                    className="w-14 h-14 rounded-control object-cover flex-shrink-0 shadow-soft-sm transition-transform duration-200 group-hover:scale-105"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-control bg-gray-100 flex items-center justify-center flex-shrink-0 border border-dashed border-gray-200">
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
                                  <p className="text-sm font-semibold text-brand-700 mt-1">
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
                          <p className="text-sm text-gray-600">No properties found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleTabSearch}
                  className="px-6 py-3 rounded-control text-sm font-semibold flex items-center justify-center gap-2 text-white bg-brand-500 hover:bg-brand-700 shadow-soft-sm hover:shadow-brand-glow transition-all"
                >
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* Owner CTA strip */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-gray-600">
            <span>Are you a property owner?</span>
            <button
              onClick={handleCreatePost}
              className="px-4 py-2 rounded-control text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-soft-sm transition-colors"
            >
              Post Your Property — Free
            </button>
          </div>
        </div>
      </section>

      {/* ==================== PROMO BANNER ==================== */}
      <section className="bg-brand-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <span className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-brand-200" />
            New here? Browse verified listings with real, rich photo galleries.
          </span>
          <button
            onClick={() => navigate("/property-feed")}
            className="px-4 py-1.5 rounded-control text-xs font-semibold bg-white text-brand-800 hover:bg-brand-50 transition-colors whitespace-nowrap"
          >
            Explore Listings
          </button>
        </div>
      </section>

      <div className="max-w-6xl mx-auto">
        {/* ==================== QUICK LINKS ICON ROW ==================== */}
        <section className="px-4 py-6 border-b border-gray-100">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-center">
            {[
              { icon: Building2, label: "Browse Properties", action: "feed" },
              { icon: Plus, label: "Post a Property", action: "post" },
              { icon: Heart, label: "Favourites", action: "favourites" },
              { icon: Camera, label: "Stories", action: "stories" },
              { icon: UserPlus, label: "For Owners", action: "signup-owner" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handleQuickLink(item.action)}
                className="flex flex-col items-center gap-2 p-2 rounded-control hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center justify-center w-11 h-11 rounded-full bg-brand-50 text-brand-600">
                  <item.icon className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-medium text-gray-700 leading-tight">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ==================== WHY CHOOSE US ==================== */}
        <section className="px-4 py-8">
          <div className="text-center mb-6">
            <Shuffle
              tag="h2"
              text="Why Choose Town Exchange"
              className="text-lg md:text-xl font-semibold text-gray-900 inline-block"
              textAlign="center"
              triggerOnce
              respectReducedMotion
            />
            <p className="mt-1 text-sm text-gray-500">A simpler way to find your next home</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {WHY_US.map((item) => (
              <div
                key={item.title}
                className="text-center p-4 rounded-card border border-gray-100 hover:border-brand-200 hover:shadow-soft-md transition-all"
              >
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand-600 mb-3">
                  <item.icon className="w-6 h-6" />
                </span>
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== STORIES ==================== */}
        {config.featuredSection?.enabled && (
          <section id="stories-section" className="px-4 py-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                {config.featuredSection.title}
              </h2>
              {stories.length > 0 && (
                <span className="text-xs font-medium text-brand-700 px-2.5 py-1 bg-brand-50 rounded-full border border-brand-200 shadow-soft-sm">
                  {stories.length}
                </span>
              )}
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-hide">
              <button
                onClick={() => setShowStoryModal(true)}
                className="flex-shrink-0 snap-start w-24 h-32 rounded-card bg-gray-50 border-2 border-dashed border-brand-200 hover:border-brand-600 flex flex-col items-center justify-center gap-2 transition-all shadow-soft-sm hover:shadow-soft-md"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-soft-sm bg-brand-500">
                  <Plus className="text-white w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-gray-700">Create</span>
              </button>

              {storiesLoading &&
                stories.length === 0 &&
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="flex-shrink-0 w-24 h-32 rounded-card bg-gray-100 animate-pulse shadow-inner"
                  />
                ))}

              {stories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => handleStoryClick(story)}
                  className="flex-shrink-0 snap-start w-24 h-32 rounded-card overflow-hidden relative group border border-brand-100 shadow-soft-sm hover:shadow-soft-md transition-shadow"
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
                  <div className="absolute inset-0 rounded-card ring-2 ring-brand-600 ring-offset-1 ring-offset-white" />
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
                  className={`flex-shrink-0 snap-start w-24 h-32 rounded-card bg-gradient-to-br ${story.gradient} relative p-2 border border-brand-100/60 shadow-soft-sm hover:shadow-soft-md transition-shadow`}
                >
                  <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-base text-brand-700 shadow-soft-sm">
                    {story.emoji}
                  </div>
                  <p className="absolute bottom-1.5 left-1.5 right-1.5 text-white text-xs font-semibold drop-shadow leading-tight">
                    {story.title}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ==================== CATEGORIES ==================== */}
        <section className="px-4 py-5">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3">
            {config.categories.title}
          </h2>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
            initial={shouldReduceMotion ? "visible" : "hidden"}
            animate="visible"
          >
            {config.categories.items.map((category) => {
              const colors = colorClasses[category.color] || colorClasses.purple;
              return (
                <motion.button
                  key={category.id}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } } }}
                  whileTap={{ scale: 0.97 }}
                  whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                  onClick={() => handleCategoryClick(category)}
                  className={`relative rounded-card bg-white border border-gray-100 hover:border-brand-300 transition-colors duration-200 px-4 py-4 shadow-soft-sm hover:shadow-soft-md w-full ${colors.hover}`}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center mx-auto mb-2 shadow-soft-sm border border-white/70`}>
                      <DynamicIcon name={category.icon} size={20} className={`${colors.text}`} strokeWidth={2} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{category.name}</p>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </section>

        {/* ==================== BUILDER / PARTNER BANNER ==================== */}
        <section className="px-4 py-6">
          <div className="rounded-card bg-gray-50 border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-brand-50 text-brand-600">
              <Building2 className="w-10 h-10" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-semibold text-gray-900">
                Listing multiple properties as an agent or builder?
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Post all your listings in one place and reach serious, verified buyers and tenants.
              </p>
            </div>
            <button
              onClick={() => navigate("/signup", { state: { defaultRole: "owner" } })}
              className="flex-shrink-0 px-5 py-2.5 rounded-control text-sm font-semibold text-white bg-brand-500 hover:bg-brand-700 shadow-soft-sm hover:shadow-brand-glow transition-all"
            >
              Get Started
            </button>
          </div>
        </section>

        {/* ==================== LIVE STATS ==================== */}
        <section className="px-4 py-8 border-t border-gray-100">
          <div className="text-center mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Growing Every Day</h2>
            <p className="mt-1 text-sm text-gray-500">Real numbers from Town Exchange, updated live</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { label: "Properties Listed", value: platformStats?.properties?.total },
              { label: "Active Stories", value: platformStats?.stories?.active_stories },
              { label: "Categories Available", value: categoryStats ? Object.keys(categoryStats.categories).length : undefined },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-2 border-brand-200 flex items-center justify-center">
                  <span className="font-display text-2xl font-semibold text-brand-600">
                    {stat.value ?? "…"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600 text-center">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== HOW IT WORKS ==================== */}
        <section className="bg-brand-900 -mx-4 px-4 py-10 md:rounded-card md:mx-0">
          <h2 className="text-center text-lg md:text-xl font-semibold text-white mb-6">
            How Town Exchange Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="bg-white rounded-card p-5 shadow-soft-md">
                <span className="text-xs font-bold text-brand-500">{item.step}</span>
                <p className="mt-1 font-semibold text-gray-900">{item.title}</p>
                <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== CHENNAI LOCALITY LINKS ==================== */}
        <section className="px-4 py-8">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Popular in Chennai</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Flats for Rent</p>
              <div className="flex flex-wrap gap-2">
                {CHENNAI_LOCALITIES.map((locality) => (
                  <button
                    key={`rent-${locality}`}
                    onClick={() => handleLocalityClick(locality, "Rent/Lease")}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 border border-gray-200 text-gray-700 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                  >
                    {locality}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Flats for Sale</p>
              <div className="flex flex-wrap gap-2">
                {CHENNAI_LOCALITIES.map((locality) => (
                  <button
                    key={`sale-${locality}`}
                    onClick={() => handleLocalityClick(locality, "Sell")}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 border border-gray-200 text-gray-700 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                  >
                    {locality}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== QUICK LINKS (2 COLUMN) ==================== */}
        <section className="px-4 py-8 border-t border-gray-100">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Explore Town Exchange</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.entries(QUICK_LINKS).map(([heading, links]) => (
              <div key={heading}>
                <p className="text-sm font-semibold text-gray-700 mb-2">{heading}</p>
                <ul className="space-y-1.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <button
                        onClick={() => handleQuickLink(link.action)}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-600 transition-colors"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== DUAL CTA BAND ==================== */}
        <section className="px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-card bg-brand-50 border border-brand-100 p-6 text-center">
              <ClipboardList className="w-8 h-8 text-brand-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">Find Property</p>
              <p className="mt-1 text-xs text-gray-500 mb-4">Browse verified listings across Chennai</p>
              <button
                onClick={() => navigate("/property-feed")}
                className="px-5 py-2.5 rounded-control text-sm font-semibold text-white bg-brand-500 hover:bg-brand-700 shadow-soft-sm transition-colors"
              >
                Find Now
              </button>
            </div>
            <div className="rounded-card bg-emerald-50 border border-emerald-100 p-6 text-center">
              <Key className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">List Your Property</p>
              <p className="mt-1 text-xs text-gray-500 mb-4">Reach buyers and tenants directly, without brokerage</p>
              <button
                onClick={handleCreatePost}
                className="px-5 py-2.5 rounded-control text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-soft-sm transition-colors"
              >
                Free Posting
              </button>
            </div>
          </div>
        </section>

        {/* ==================== FAVOURITES CTA ==================== */}
        {config.favouritesSection?.enabled && (
          <section className="px-4 py-5 pb-8">
            <button
              onClick={handleViewFavourites}
              className="group relative w-full rounded-card bg-rose-50/90 border border-rose-200/80 hover:border-rose-400/80 hover:bg-rose-100/90 transition-all duration-300 px-4 py-4 shadow-soft-sm hover:shadow-soft-lg hover:shadow-rose-100/70 hover:-translate-y-1 active:scale-[0.98]"
            >
              <div className="pointer-events-none absolute inset-0 rounded-card opacity-0 group-hover:opacity-100 blur transition-all duration-300 bg-gradient-to-br from-rose-400/20 to-red-400/20" />
              <div className="relative z-10 flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center ring-2 ring-white/60 shadow-soft-md">
                  <DynamicIcon name={config.favouritesSection.icon || "Heart"} size={22} className="text-white" />
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

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img src={APP_LOGO_SRC} alt={APP_NAME} className="h-8 w-8 rounded-full object-contain bg-white border border-gray-200" />
              <span className="font-display text-sm font-semibold text-gray-800">{APP_NAME}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-500">
              <a href="#" className="hover:text-brand-600 transition-colors">About Us</a>
              <a href="#" className="hover:text-brand-600 transition-colors">Terms &amp; Conditions</a>
              <a href="#" className="hover:text-brand-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-brand-600 transition-colors">FAQs</a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <Users2 className="w-3.5 h-3.5" />
            <span>&copy; {new Date().getFullYear()} {APP_NAME}. Built for Chennai, by Chennai.</span>
          </div>
        </div>
      </footer>

      <style>{`
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
