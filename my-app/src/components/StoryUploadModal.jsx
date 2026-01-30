import React, { useState, useRef } from "react";
import { Camera, Image as ImageIcon } from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function StoryUploadModal({ isOpen, onClose, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setError("Please select an image or video file");
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        setError("File size must be less than 50MB");
        return;
      }

      setError("");
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (caption) formData.append("caption", caption);
      if (location) formData.append("location", location);

      const response = await axios.post(`${API_BASE_URL}/api/stories`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (onSuccess) {
        onSuccess(response.data);
      }

      handleClose();
    } catch (error) {
      console.error("❌ Error uploading story:", error);
      setError(
        error.response?.data?.detail ||
          "Failed to upload story. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaption("");
    setLocation("");
    setError("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-3 md:px-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm md:max-w-md max-h-[90vh] overflow-y-auto border border-purple-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-sm md:text-base font-semibold text-gray-800">
            Create Story
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={uploading}
          >
            <img 
              src="/red-cross.svg" 
              alt="Close" 
              className="w-5 h-5"
            />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-3 md:px-5 md:py-4">
          {/* Error Message */}
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs md:text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {!preview ? (
            /* Upload Options */
            <div className="space-y-3 md:space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Camera
                    size={32}
                    className="md:w-10 md:h-10 text-purple-600"
                  />
                </div>
                <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-1.5">
                  Add to Your Story
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Share a moment that disappears in 24 hours
                </p>
              </div>

              {/* Camera Button */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full py-3 md:py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm md:text-base font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md flex items-center justify-center gap-2.5"
              >
                <Camera size={18} className="md:w-5 md:h-5" />
                Open Camera
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*,video/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* File Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 md:py-3.5 px-4 bg-white border-2 border-purple-600 text-purple-600 rounded-xl text-sm md:text-base font-semibold hover:bg-purple-50 transition-all flex items-center justify-center gap-2.5"
              >
                <ImageIcon size={18} className="md:w-5 md:h-5" />
                Choose from Device
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-[11px] md:text-xs text-purple-800 text-center font-medium">
                  Supported: Images (JPG, PNG, GIF) & Videos (MP4, MOV)
                </p>
                <p className="text-[11px] md:text-xs text-purple-700 text-center">
                  Max size: 50MB
                </p>
              </div>
            </div>
          ) : (
            /* Preview and Upload */
            <div className="space-y-3 md:space-y-4">
              {/* Media Preview */}
              <div className="relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                {selectedFile && selectedFile.type.startsWith("image/") ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-auto max-h-72 object-contain"
                  />
                ) : (
                  <video
                    src={preview}
                    controls
                    className="w-full h-auto max-h-72 object-contain"
                  />
                )}
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
                  disabled={uploading}
                >
                  <img 
                    src="/red-cross.svg" 
                    alt="Remove" 
                    className="w-4 h-4"
                  />
                </button>
              </div>

              {/* Caption Input */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                  Caption (Optional)
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  rows={3}
                  maxLength={200}
                  className="w-full px-3 md:px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-none text-xs md:text-sm"
                  disabled={uploading}
                />
                <p className="text-[11px] md:text-xs text-gray-500 mt-1 text-right">
                  {caption.length}/200
                </p>
              </div>

              {/* Location Input */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1.5">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location..."
                  maxLength={100}
                  className="w-full px-3 md:px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-xs md:text-sm"
                  disabled={uploading}
                />
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3 md:py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm md:text-base font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Uploading...
                  </div>
                ) : (
                  "Share to Story"
                )}
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                <p className="text-[11px] md:text-xs text-blue-700 text-center font-medium">
                  ⏰ Your story will be visible for 24 hours
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
