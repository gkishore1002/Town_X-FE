import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DynamicLandingPage from './components/DynamicLandingPage';
import StoryViewer from './components/StoryViewer';
import PropertyFeed from './components/PropertyFeed';
import PropertyDetails from './components/PropertyDetails';
import Favourites from './components/Favourites';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ProtectedRoute from './components/auth/ProtectedRoute';
import OwnerDashboard from './components/dashboard/OwnerDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DynamicLandingPage />} />
        <Route path="/story/:id" element={<StoryViewer />} />
        <Route path="/property-feed" element={<PropertyFeed />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/favourites" element={<Favourites />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
