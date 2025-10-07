"use client";

import { PropertyType } from "@/types/propertyType";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PropertyTypeImageUpload from "./PropertyTypeImageUpload";

interface PropertyTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyType?: PropertyType | null;
  onSave: () => void;
}

const PropertyTypeModal: React.FC<PropertyTypeModalProps> = ({
  isOpen,
  onClose,
  propertyType,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    image: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (propertyType) {
      setFormData({
        name: propertyType.name,
        description: propertyType.description,
        icon: propertyType.icon || "",
        image: propertyType.image,
        isActive: propertyType.isActive ?? true,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        icon: "",
        image: "",
        isActive: true,
      });
    }
    setIsClosing(false);
  }, [propertyType, isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200); // Match the transition duration
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = propertyType ? "PUT" : "POST";
      const url = propertyType
        ? `/api/property-types/${propertyType._id}`
        : "/api/property-types";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          `Property type ${propertyType ? "updated" : "created"} successfully!`
        );
        onSave();
        handleClose();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save property type");
      }
    } catch (error) {
      console.error("Error saving property type:", error);
      toast.error("Error saving property type");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-200 ease-out ${
        isOpen && !isClosing ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-4 text-center sm:block sm:p-0 sm:items-center">
        {/* Background overlay */}
        <div
          className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-all duration-200 ease-out ${
            isOpen && !isClosing ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleClose}
        />

        {/* Modal content */}
        <div
          className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-t-lg sm:rounded-lg text-left overflow-hidden shadow-xl transform transition-all duration-200 ease-out w-full max-w-lg sm:my-8 sm:align-middle ${
            isOpen && !isClosing
              ? "opacity-100 translate-y-0 sm:scale-100"
              : "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          }`}
        >
          <form onSubmit={handleSubmit}>
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {propertyType ? "Edit Property Type" : "Add Property Type"}
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1"
                >
                  <Icon icon="ph:x" width={24} height={24} />
                </button>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4 space-y-4 max-h-[60vh] sm:max-h-none overflow-y-auto">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-150 focus:ring-2 focus:ring-opacity-50"
                  placeholder="e.g., Apartments"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-150 focus:ring-2 focus:ring-opacity-50"
                  placeholder="Brief description of this property type"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Icon (Iconify)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-all duration-150 focus:ring-2 focus:ring-opacity-50"
                    placeholder="e.g., ph:building"
                  />
                  {formData.icon && (
                    <Icon
                      icon={formData.icon}
                      width={20}
                      height={20}
                      className="text-gray-500 sm:w-6 sm:h-6"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Browse icons at{" "}
                  <a
                    href="https://icon-sets.iconify.design/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    icon-sets.iconify.design
                  </a>
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Property Type Image *
                </label>
                <PropertyTypeImageUpload
                  value={formData.image}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, image: url }))
                  }
                  disabled={loading}
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded transition-colors duration-150"
                  id="active"
                />
                <label
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  htmlFor="active"
                >
                  Active
                </label>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-700 flex flex-col-reverse space-y-reverse space-y-3 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {propertyType ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyTypeModal;
