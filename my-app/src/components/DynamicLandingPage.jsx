import { useCallback, useRef, useEffect } from "react";
import {
  MapPin,
  Percent,
  Images,
  Heart,
  ShieldCheck,
  Camera,
  Building2,
  LogOut,
  ArrowRight,
  Sparkles,
  Users2,
  Home,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { motion, useReducedMotion, useInView } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth, ROLE_HOME_ROUTE } from "../context/AuthContext";
import { useAuthDrawer, useLogout } from "@/context/AuthDrawerContext";

import { TownExchangeLogo, APP_NAME } from "@/components/brand/TownExchangeLogo";
const APP_LOCATION = "Chennai, India";

const WHY_US = [
  {
    icon: Percent,
    title: "No Brokerage Fees",
    description: "Connect with owners directly — zero middleman commission.",
    accent: "from-blue-500/10 to-brand-500/5",
  },
  {
    icon: Images,
    title: "Rich Photo Galleries",
    description: "Every listing comes with real, high-quality property photos.",
    accent: "from-violet-500/10 to-purple-500/5",
  },
  {
    icon: Heart,
    title: "Instant Favourites",
    description: "Save properties you love and revisit them anytime.",
    accent: "from-rose-500/10 to-pink-500/5",
  },
  {
    icon: Camera,
    title: "24-Hour Stories",
    description: "See fresh listings the moment owners share them.",
    accent: "from-amber-500/10 to-orange-500/5",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create Your Account",
    description: "Sign up in seconds as a buyer, renter, or property owner.",
  },
  {
    step: "02",
    title: "Browse & Discover",
    description: "Explore verified listings by location, price, and BHK.",
  },
  {
    step: "03",
    title: "Connect Directly",
    description: "Reach out to owners without brokers in between.",
  },
  {
    step: "04",
    title: "Move Forward",
    description: "Save favourites, compare options, and finalize with confidence.",
  },
];

const AUDIENCES = [
  {
    icon: Home,
    title: "For Buyers & Renters",
    points: [
      "Browse verified Chennai listings",
      "Save and compare favourites",
      "Contact owners directly",
    ],
    cta: "Sign up as Buyer",
    role: "buyer",
    gradient: "from-brand-600 to-brand-800",
  },
  {
    icon: KeyRound,
    title: "For Owners & Agents",
    points: [
      "List properties for free",
      "Manage listings from your dashboard",
      "Reach serious tenants and buyers",
    ],
    cta: "Sign up as Owner",
    role: "owner",
    gradient: "from-emerald-600 to-teal-700",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
};

function RevealSection({ children, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <motion.section
      ref={ref}
      className={className}
      variants={stagger}
      initial="hidden"
      animate={reduceMotion || inView ? "visible" : "hidden"}
    >
      {children}
    </motion.section>
  );
}

function FloatingOrb({ className, delay = 0, duration = 8 }) {
  const reduceMotion = useReducedMotion() ?? false;
  if (reduceMotion) {
    return <div className={`absolute rounded-full blur-3xl ${className}`} />;
  }
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${className}`}
      animate={{ y: [0, -20, 0], x: [0, 10, 0], scale: [1, 1.05, 1] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

export default function DynamicLandingPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion() ?? false;
  const { user, isAuthenticated } = useAuth();
  const { openAuthDrawer } = useAuthDrawer();
  const logoutToHome = useLogout();

  const goToApp = useCallback(() => {
    if (!isAuthenticated || !user) return;
    navigate(ROLE_HOME_ROUTE[user.role]);
  }, [isAuthenticated, navigate, user]);

  const goToLogin = useCallback(() => {
    openAuthDrawer("login", { from: "/home" });
  }, [openAuthDrawer]);

  /** New visitors → signup; after signup/login they land on /home (buyers) or role dashboard. */
  const goToSignup = useCallback(
    (role) => {
      openAuthDrawer("signup", {
        from: "/home",
        ...(role ? { defaultRole: role } : {}),
      });
    },
    [openAuthDrawer]
  );

  // Logged-in buyers skip the public marketing page and go straight to the app home.
  useEffect(() => {
    if (isAuthenticated && user?.role === "buyer") {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-gray-900 overflow-x-hidden">
      <motion.header
        className="fixed top-0 inset-x-0 z-50 border-b border-white/20 bg-white/80 backdrop-blur-xl safe-top"
        initial={reduceMotion ? false : { y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="px-4 py-3 max-w-6xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
          >
            <TownExchangeLogo size={36} />
            <div className="min-w-0 flex flex-col text-left">
              <span className="font-display text-base font-semibold leading-tight tracking-wide">
                {APP_NAME}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                {APP_LOCATION}
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                <motion.button
                  whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  onClick={goToApp}
                  className="hidden sm:inline-flex px-4 py-2 rounded-control text-sm font-semibold text-white bg-brand-500 hover:bg-brand-700 shadow-soft-sm transition-colors"
                >
                  Go to App
                </motion.button>
                <button
                  onClick={logoutToHome}
                  title="Log out"
                  className="p-2 rounded-control text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  onClick={goToLogin}
                  className="hidden sm:inline-flex px-3 py-2 rounded-control text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Log in
                </motion.button>
                <motion.button
                  whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  onClick={() => goToSignup()}
                  className="px-4 py-2 rounded-control text-sm font-semibold border-2 border-brand-500 text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  Get Started
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.header>

      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
        <FloatingOrb className="w-72 h-72 bg-brand-400/25 top-10 -left-20" />
        <FloatingOrb className="w-96 h-96 bg-violet-400/20 top-24 -right-24" delay={1.2} duration={11} />
        <FloatingOrb className="w-64 h-64 bg-emerald-400/15 bottom-0 left-1/3" delay={0.6} />

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-brand-100 text-brand-700 text-xs font-semibold shadow-soft-sm mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Chennai&apos;s No-Brokerage Property Marketplace
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-gray-900 leading-[1.08]"
            >
              Find your next home
              <span className="block mt-1 bg-gradient-to-r from-brand-600 via-brand-500 to-violet-600 bg-clip-text text-transparent">
                without the brokerage
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-5 text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
            >
              Town Exchange connects Chennai renters and buyers directly with
              property owners — rich photos, transparent pricing, and zero
              middleman fees.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <motion.button
                whileHover={reduceMotion ? undefined : { scale: 1.03, y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                onClick={isAuthenticated ? goToApp : () => goToSignup()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-control text-sm font-semibold text-white bg-brand-500 hover:bg-brand-700 shadow-soft-lg hover:shadow-brand-glow transition-shadow flex items-center justify-center gap-2"
              >
                {isAuthenticated ? "Open Town Exchange" : "Get Started"}
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                onClick={isAuthenticated ? goToApp : () => goToSignup()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-control text-sm font-semibold border-2 border-gray-200 bg-white/80 hover:border-brand-300 hover:bg-white transition-colors"
              >
                Create Free Account
              </motion.button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
            >
              {[
                { icon: Percent, label: "Zero Brokerage" },
                { icon: ShieldCheck, label: "Direct Owner Contact" },
                { icon: Building2, label: "Chennai Focused" },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/90 border border-gray-100 text-xs font-medium text-gray-700 shadow-soft-sm"
                >
                  <badge.icon className="w-3.5 h-3.5 text-brand-600" />
                  {badge.label}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <RevealSection className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <motion.div variants={fadeUp} className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Why Choose Town Exchange
          </h2>
          <p className="mt-2 text-sm md:text-base text-gray-500">
            A simpler, fairer way to find and list property in Chennai
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WHY_US.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              whileHover={reduceMotion ? undefined : { y: -6 }}
              className={`relative overflow-hidden rounded-card border border-white/60 bg-gradient-to-br ${item.accent} p-6 shadow-soft-md`}
            >
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white text-brand-600 shadow-soft-sm mb-4">
                <item.icon className="w-6 h-6" />
              </span>
              <p className="text-sm font-semibold text-gray-900">{item.title}</p>
              <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <motion.div
          variants={fadeUp}
          className="rounded-[1.25rem] bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 p-8 md:p-12 shadow-soft-lg overflow-hidden relative"
        >
          <FloatingOrb className="w-56 h-56 bg-white/10 top-0 right-0" duration={12} />

          <div className="relative">
            <h2 className="text-center text-2xl md:text-3xl font-semibold text-white mb-2">
              How It Works
            </h2>
            <p className="text-center text-sm text-brand-100 mb-10 max-w-lg mx-auto">
              Everything unlocks after you sign in — browse listings, save
              favourites, and manage properties from one place.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {HOW_IT_WORKS.map((item) => (
                <motion.div
                  key={item.step}
                  variants={fadeUp}
                  whileHover={reduceMotion ? undefined : { y: -4 }}
                  className="bg-white/95 backdrop-blur rounded-card p-5 shadow-soft-md"
                >
                  <span className="text-xs font-bold text-brand-500">{item.step}</span>
                  <p className="mt-1 font-semibold text-gray-900">{item.title}</p>
                  <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </RevealSection>

      <RevealSection className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <motion.div variants={fadeUp} className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Built for Everyone in Chennai
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Whether you&apos;re searching or listing, Town Exchange has you covered
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {AUDIENCES.map((audience) => (
            <motion.div
              key={audience.title}
              variants={fadeUp}
              whileHover={reduceMotion ? undefined : { y: -4 }}
              className="rounded-card bg-white border border-gray-100 p-8 shadow-soft-md relative overflow-hidden group"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${audience.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300`}
              />
              <div className="relative">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-50 text-brand-600 mb-4">
                  <audience.icon className="w-7 h-7" />
                </span>
                <h3 className="text-lg font-semibold text-gray-900">{audience.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {audience.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  onClick={() => (isAuthenticated ? goToApp() : goToSignup(audience.role))}
                  className="mt-6 px-5 py-2.5 rounded-control text-sm font-semibold text-white bg-brand-500 hover:bg-brand-700 shadow-soft-sm transition-colors"
                >
                  {isAuthenticated ? "Go to App" : audience.cta}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </RevealSection>

      <RevealSection className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <motion.div
          variants={fadeUp}
          className="text-center rounded-[1.5rem] bg-white border border-gray-100 px-6 py-12 md:px-12 md:py-16 shadow-soft-lg relative overflow-hidden"
        >
          <FloatingOrb className="w-48 h-48 bg-brand-300/20 -top-10 -right-10" delay={0.3} />
          <div className="relative">
            <h2 className="font-display text-2xl md:text-4xl font-semibold text-gray-900">
              Ready to get started?
            </h2>
            <p className="mt-3 text-sm md:text-base text-gray-500 max-w-lg mx-auto">
              Join Town Exchange today. Listings, favourites, property stories,
              and owner dashboards — all available after you log in.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.button
                whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                onClick={() => goToSignup()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-control text-sm font-semibold text-white bg-brand-500 hover:bg-brand-700 shadow-soft-md"
              >
                Create Free Account
              </motion.button>
              <motion.button
                whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                onClick={goToLogin}
                className="w-full sm:w-auto px-8 py-3.5 rounded-control text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
              >
                I already have an account
              </motion.button>
            </div>
          </div>
        </motion.div>
      </RevealSection>

      <footer className="border-t border-gray-200 bg-white/80">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <TownExchangeLogo size={32} />
              <span className="font-display text-sm font-semibold text-gray-800">{APP_NAME}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-500">
              <span>About Us</span>
              <span>Terms &amp; Conditions</span>
              <span>Privacy Policy</span>
              <span>FAQs</span>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <Users2 className="w-3.5 h-3.5" />
            <span>
              &copy; {new Date().getFullYear()} {APP_NAME}. Built for Chennai, by Chennai.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
