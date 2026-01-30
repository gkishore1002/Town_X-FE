import axios from 'axios';

// Base API URL - Update this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Properties API
export const propertyAPI = {
  // Get all properties with filters
  getProperties: async (params = {}) => {
    try {
      const response = await api.get('/api/properties', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  // Get single property by ID
  getPropertyById: async (id) => {
    try {
      const response = await api.get(`/api/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  },

  // Search properties
  searchProperties: async (query, limit = 20) => {
    try {
      const response = await api.get('/api/properties/search', {
        params: { q: query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  },

  // Create new property
  createProperty: async (formData) => {
    try {
      const response = await api.post('/api/properties', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },

  // Delete property
  deleteProperty: async (id) => {
    try {
      const response = await api.delete(`/api/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  },

  // Get statistics
  getStats: async () => {
    try {
      const response = await api.get('/api/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  // Get category statistics
  getCategoryStats: async () => {
    try {
      const response = await api.get('/api/categories/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching category stats:', error);
      throw error;
    }
  },

  // NEW FAVOURITE METHODS

  // Toggle favourite status of a property
  toggleFavourite: async (propertyId) => {
    try {
      const response = await api.post(`/api/properties/${propertyId}/favourite`);
      return response.data;
    } catch (error) {
      console.error('Error toggling favourite:', error);
      throw error;
    }
  },

  // Get all favourite properties
  getFavourites: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get('/api/favourites', {
        params: { skip, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching favourites:', error);
      throw error;
    }
  },

  // Get count of favourite properties
  getFavouritesCount: async () => {
    try {
      const response = await api.get('/api/favourites/count');
      return response.data;
    } catch (error) {
      console.error('Error fetching favourites count:', error);
      throw error;
    }
  },
};

export default api;
