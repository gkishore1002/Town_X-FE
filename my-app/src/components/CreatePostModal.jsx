import React, { useState } from "react";
import { ArrowLeft, Upload, IndianRupee } from "lucide-react";
import { propertyAPI } from "../services/api";

export default function CreatePostModal({ isOpen, onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [formData, setFormData] = useState({
    propertyFor: "",
    propertyType: "",
    userType: "",
    bhkType: "",
    apartmentType: "",
    apartmentName: "",
    locality: "",
    city: "",
    address: "",
    builtUpArea: "",
    carpetArea: "",
    floor: "",
    totalFloors: "",
    propertyAge: "",
    furnishingStatus: "",
    parking: "0",
    bathrooms: "0",
    balconies: "0",
    expectedPrice: "",
    maintenanceCharges: "",
    securityDeposit: "",
    availableFrom: "",
    description: "",
    amenities: [],
  });

  const amenitiesList = [
    "Lift",
    "Power Backup",
    "Swimming Pool",
    "Gym",
    "Park",
    "Club House",
    "Security",
    "Water Supply",
    "Visitor Parking",
    "Gas Pipeline",
    "WiFi",
    "AC",
    "Modular Kitchen",
  ];

  const steps = [
    { label: "Property Type" },
    { label: "Details" },
    { label: "Pricing" },
    { label: "Photos" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAmenityToggle = (amenity) => {
    const updatedAmenities = formData.amenities.includes(amenity)
      ? formData.amenities.filter((item) => item !== amenity)
      : [...formData.amenities, amenity];
    setFormData({ ...formData, amenities: updatedAmenities });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + uploadedFiles.length > 20) {
      alert("Maximum 20 images allowed");
      return;
    }
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (
        !formData.propertyFor ||
        !formData.propertyType ||
        !formData.userType ||
        !formData.apartmentType ||
        !formData.bhkType
      ) {
        alert("Please fill all required fields");
        return;
      }
    } else if (currentStep === 2) {
      if (
        !formData.city ||
        !formData.locality ||
        !formData.address ||
        !formData.carpetArea ||
        !formData.floor ||
        !formData.totalFloors ||
        !formData.propertyAge ||
        !formData.furnishingStatus
      ) {
        alert("Please fill all required fields");
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.expectedPrice || !formData.availableFrom) {
        alert("Please fill all required fields");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleClose = () => {
    if (uploading) return;
    setFormData({
      propertyFor: "",
      propertyType: "",
      userType: "",
      bhkType: "",
      apartmentType: "",
      apartmentName: "",
      locality: "",
      city: "",
      address: "",
      builtUpArea: "",
      carpetArea: "",
      floor: "",
      totalFloors: "",
      propertyAge: "",
      furnishingStatus: "",
      parking: "0",
      bathrooms: "0",
      balconies: "0",
      expectedPrice: "",
      maintenanceCharges: "",
      securityDeposit: "",
      availableFrom: "",
      description: "",
      amenities: [],
    });
    setUploadedFiles([]);
    setCurrentStep(1);
    onClose();
  };

  const handleSubmit = async () => {
    if (uploadedFiles.length < 1) {
      alert("Please upload at least 1 property image");
      return;
    }

    setUploading(true);

    try {
      const submitData = new FormData();

      submitData.append("propertyFor", formData.propertyFor);
      submitData.append("propertyType", formData.propertyType);
      submitData.append("userType", formData.userType);
      submitData.append("bhkType", formData.bhkType);
      submitData.append("apartmentType", formData.apartmentType);
      submitData.append("apartmentName", formData.apartmentName || "");
      submitData.append("locality", formData.locality);
      submitData.append("city", formData.city);
      submitData.append("address", formData.address);
      submitData.append("builtUpArea", formData.builtUpArea || "0");
      submitData.append("carpetArea", formData.carpetArea);
      submitData.append("floor", formData.floor);
      submitData.append("totalFloors", formData.totalFloors);
      submitData.append("propertyAge", formData.propertyAge);
      submitData.append("furnishingStatus", formData.furnishingStatus);
      submitData.append("parking", formData.parking);
      submitData.append("bathrooms", formData.bathrooms);
      submitData.append("balconies", formData.balconies);
      submitData.append("expectedPrice", formData.expectedPrice);
      submitData.append(
        "maintenanceCharges",
        formData.maintenanceCharges || "0"
      );
      submitData.append("securityDeposit", formData.securityDeposit || "0");
      submitData.append("availableFrom", formData.availableFrom);
      submitData.append("description", formData.description || "");
      submitData.append("amenities", JSON.stringify(formData.amenities));

      uploadedFiles.forEach((file) => {
        submitData.append("files", file);
      });

      const response = await propertyAPI.createProperty(submitData);

      alert("Property posted successfully!");
      if (onSuccess) {
        onSuccess(response.id);
      }
    } catch (error) {
      console.error("Error submitting property:", error);
      alert(
        error.response?.data?.detail ||
          "Failed to post property. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-2 md:px-3 py-2"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-purple-100 max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - More Compact */}
        <header className="px-3 py-2.5 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={uploading}
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <h1 className="text-sm md:text-base font-semibold text-gray-800">
              Post Your Property
            </h1>
          </div>
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
        </header>

        {/* Progress - More Compact */}
        <div className="bg-white px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentStep > index + 1
                        ? "bg-green-500"
                        : currentStep === index + 1
                        ? "bg-purple-600 ring-2 ring-purple-200"
                        : "bg-gray-300"
                    }`}
                  >
                    {currentStep > index + 1 ? (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <div
                        className={`w-2 h-2 rounded-full ${
                          currentStep === index + 1
                            ? "bg-white"
                            : "bg-transparent"
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-medium text-center ${
                      currentStep === index + 1
                        ? "text-purple-600"
                        : currentStep > index + 1
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1.5 mb-3 relative bg-gray-300">
                    <div
                      className={`absolute h-full transition-all duration-500 ${
                        currentStep > index + 1
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                      style={{
                        width: currentStep > index + 1 ? "100%" : "0%",
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Scrollable content - More Compact */}
        <div className="flex-1 overflow-y-auto px-3 py-3 bg-gray-50">
          <div className="space-y-3">
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
                <h2 className="text-sm font-semibold text-gray-800 mb-1">
                  Property Information
                </h2>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    You are looking to<span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Rent/Lease", "Sell", "PG/Hostel"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, propertyFor: option })
                        }
                        className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                          formData.propertyFor === option
                            ? "border-purple-600 bg-purple-50 text-purple-600"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Property Type<span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Residential", "Commercial"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, propertyType: option })
                        }
                        className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                          formData.propertyType === option
                            ? "border-purple-600 bg-purple-50 text-purple-600"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    You are<span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Owner", "Broker/Agent"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, userType: option })
                        }
                        className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                          formData.userType === option
                            ? "border-purple-600 bg-purple-50 text-purple-600"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Apartment Type<span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      "Flat",
                      "Independent House",
                      "Villa",
                      "Builder Floor",
                      "Plot/Land",
                    ].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, apartmentType: option })
                        }
                        className={`p-2 rounded-lg border-2 text-[10px] font-medium transition-all ${
                          formData.apartmentType === option
                            ? "border-purple-600 bg-purple-50 text-purple-600"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    BHK Type<span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      "1 RK",
                      "1 BHK",
                      "2 BHK",
                      "3 BHK",
                      "4 BHK",
                      "5 BHK",
                      "5+ BHK",
                    ].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, bhkType: option })
                        }
                        className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                          formData.bhkType === option
                            ? "border-purple-600 bg-purple-50 text-purple-600"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
                <h2 className="text-sm font-semibold text-gray-800 mb-1">
                  Property Details
                </h2>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      City<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                      className="w-full px-2.5 py-2 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Locality<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="locality"
                      value={formData.locality}
                      onChange={handleInputChange}
                      placeholder="Enter locality/area"
                      className="w-full px-2.5 py-2 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Apartment/Society Name
                  </label>
                  <input
                    type="text"
                    name="apartmentName"
                    value={formData.apartmentName}
                    onChange={handleInputChange}
                    placeholder="Enter apartment name"
                    className="w-full px-2.5 py-2 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Full Address<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
                    rows="2"
                    className="w-full px-2.5 py-2 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Carpet Area (sq.ft)
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="carpetArea"
                      value={formData.carpetArea}
                      onChange={handleInputChange}
                      placeholder="Sq.ft"
                      className="w-full px-2.5 py-2 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Built-up Area (sq.ft)
                    </label>
                    <input
                      type="number"
                      name="builtUpArea"
                      value={formData.builtUpArea}
                      onChange={handleInputChange}
                      placeholder="Sq.ft"
                      className="w-full px-2.5 py-2 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Floor Number<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="floor"
                      value={formData.floor}
                      onChange={handleInputChange}
                      placeholder="Floor"
                      className="w-full px-2.5 py-2 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Total Floors<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalFloors"
                      value={formData.totalFloors}
                      onChange={handleInputChange}
                      placeholder="Total"
                      className="w-full px-2.5 py-2 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Property Age<span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["0-1 Year", "1-5 Years", "5-10 Years", "10+ Years"].map(
                      (option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, propertyAge: option })
                          }
                          className={`p-2 rounded-lg border-2 text-[10px] font-medium transition-all ${
                            formData.propertyAge === option
                              ? "border-purple-600 bg-purple-50 text-purple-600"
                              : "border-gray-300 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          {option}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Furnishing Status<span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      "Fully Furnished",
                      "Semi Furnished",
                      "Unfurnished",
                    ].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            furnishingStatus: option,
                          })
                        }
                        className={`p-2 rounded-lg border-2 text-[10px] font-medium transition-all ${
                          formData.furnishingStatus === option
                            ? "border-purple-600 bg-purple-50 text-purple-600"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full px-2.5 py-2 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Balconies
                    </label>
                    <input
                      type="number"
                      name="balconies"
                      value={formData.balconies}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full px-2.5 py-2 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Parking
                    </label>
                    <input
                      type="number"
                      name="parking"
                      value={formData.parking}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full px-2.5 py-2 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Amenities
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {amenitiesList.map((amenity) => (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => handleAmenityToggle(amenity)}
                        className={`p-2 rounded-lg border-2 text-[10px] font-medium transition-all ${
                          formData.amenities.includes(amenity)
                            ? "border-purple-600 bg-purple-50 text-purple-600"
                            : "border-gray-300 text-gray-700 hover:border-gray-400"
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
                <h2 className="text-sm font-semibold text-gray-800 mb-1">
                  Pricing & Availability
                </h2>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Expected Price (₹)
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee
                      className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="number"
                      name="expectedPrice"
                      value={formData.expectedPrice}
                      onChange={handleInputChange}
                      placeholder="Enter amount"
                      className="w-full pl-8 pr-2.5 py-2 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                {formData.propertyFor === "Rent/Lease" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Security Deposit (₹)
                      </label>
                      <div className="relative">
                        <IndianRupee
                          className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <input
                          type="number"
                          name="securityDeposit"
                          value={formData.securityDeposit}
                          onChange={handleInputChange}
                          placeholder="Enter amount"
                          className="w-full pl-8 pr-2.5 py-2 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Monthly Maintenance (₹)
                      </label>
                      <div className="relative">
                        <IndianRupee
                          className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <input
                          type="number"
                          name="maintenanceCharges"
                          value={formData.maintenanceCharges}
                          onChange={handleInputChange}
                          placeholder="Enter amount"
                          className="w-full pl-8 pr-2.5 py-2 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Available From<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="availableFrom"
                    value={formData.availableFrom}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-2 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Property Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your property, locality, and any additional information..."
                    rows="3"
                    className="w-full px-2.5 py-2 text-xs border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Mention key features, nearby landmarks, and what makes your
                    property special
                  </p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
                <h2 className="text-sm font-semibold text-gray-800 mb-1">
                  Upload Property Photos
                </h2>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-xs text-gray-600 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-[10px] text-gray-500 mb-2">
                    Upload at least 1 photo (Max 20)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-xs cursor-pointer"
                  >
                    Choose Photos
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-700 mb-2">
                      Uploaded Photos ({uploadedFiles.length}/20)
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 bg-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          >
                            <img 
                              src="/red-cross.svg" 
                              alt="Remove" 
                              className="w-4 h-4"
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800 font-semibold mb-1">
                    Tips for better photos:
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1 ml-3 list-disc">
                    <li>Use natural lighting</li>
                    <li>Capture all rooms and amenities</li>
                    <li>Show wide angles of living spaces</li>
                    <li>Include exterior and common area shots</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom navigation - Compact */}
        <div className="border-t border-gray-200 px-3 py-2.5 bg-white rounded-b-xl flex-shrink-0">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                disabled={uploading}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={currentStep === 4 ? handleSubmit : nextStep}
              disabled={uploading}
              className="flex-1 px-4 py-2.5 text-white rounded-lg font-semibold transition-colors text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#7C01A2" }}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Uploading...
                </>
              ) : currentStep === 4 ? (
                "Submit Property"
              ) : (
                "Continue"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
