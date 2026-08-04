import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import DynamicLandingPage from "./components/DynamicLandingPage";
import { AuthRouteRedirect } from "./components/auth/AuthRouteRedirect";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthDrawerProvider } from "@/context/AuthDrawerContext";
import PageLoader from "@/components/shared/PageLoader";

const HomePage = lazy(() => import("./components/HomePage"));
const StoryViewer = lazy(() => import("./components/StoryViewer"));
const PropertyFeed = lazy(() => import("./components/PropertyFeed"));
const PropertyDetails = lazy(() => import("./components/PropertyDetails"));
const Favourites = lazy(() => import("./components/Favourites"));
const OwnerDashboard = lazy(() => import("./components/dashboard/OwnerDashboard"));
const AdminDashboard = lazy(() => import("./components/dashboard/AdminDashboard"));

function Lazy({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function App() {
  return (
    <Router>
      <AuthDrawerProvider>
        <Routes>
          <Route path="/" element={<DynamicLandingPage />} />
          <Route path="/login" element={<AuthRouteRedirect mode="login" />} />
          <Route path="/signup" element={<AuthRouteRedirect mode="signup" />} />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Lazy>
                  <HomePage />
                </Lazy>
              </ProtectedRoute>
            }
          />

          <Route
            path="/story/:id"
            element={
              <ProtectedRoute>
                <Lazy>
                  <StoryViewer />
                </Lazy>
              </ProtectedRoute>
            }
          />
          <Route
            path="/property-feed"
            element={
              <ProtectedRoute>
                <Lazy>
                  <PropertyFeed />
                </Lazy>
              </ProtectedRoute>
            }
          />
          <Route
            path="/property/:id"
            element={
              <ProtectedRoute>
                <Lazy>
                  <PropertyDetails />
                </Lazy>
              </ProtectedRoute>
            }
          />
          <Route
            path="/favourites"
            element={
              <ProtectedRoute>
                <Lazy>
                  <Favourites />
                </Lazy>
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <Lazy>
                  <OwnerDashboard />
                </Lazy>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Lazy>
                  <AdminDashboard />
                </Lazy>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthDrawerProvider>
    </Router>
  );
}

export default App;
