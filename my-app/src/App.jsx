import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DynamicLandingPage from './components/DynamicLandingPage';
import StoryViewer from './components/StoryViewer';
import PropertyFeed from './components/PropertyFeed';
import PropertyDetails from './components/PropertyDetails';
import Favourites from './components/Favourites';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DynamicLandingPage />} />
        <Route path="/story/:id" element={<StoryViewer />} />
        <Route path="/property-feed" element={<PropertyFeed />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/favourites" element={<Favourites />} />
      </Routes>
    </Router>
  );
}

export default App;
