"use client";

import AdminLoading from "@/components/Admin/AdminLoading";
import AdminSidebar from "@/components/Admin/AdminSidebar";
import PropertyTypeModal from "@/components/Admin/PropertyTypes/PropertyTypeModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { PropertyType } from "@/types/propertyType";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const AdminPropertyTypes: React.FC = () => {
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] =
    useState<PropertyType | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [propertyTypeToDelete, setPropertyTypeToDelete] =
    useState<PropertyType | null>(null);

  const fetchPropertyTypes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/property-types");
      if (response.ok) {
        const data = await response.json();
        setPropertyTypes(data.propertyTypes);
      } else {
        toast.error("Failed to fetch property types");
      }
    } catch (error) {
      console.error("Error fetching property types:", error);
      toast.error("Error loading property types");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPropertyTypes();
  }, [fetchPropertyTypes]);

  const handleAdd = () => {
    setSelectedPropertyType(null);
    setModalOpen(true);
  };

  const handleEdit = (propertyType: PropertyType) => {
    setSelectedPropertyType(propertyType);
    setModalOpen(true);
  };

  const handleDelete = (propertyType: PropertyType) => {
    setPropertyTypeToDelete(propertyType);
    setConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!propertyTypeToDelete) return;

    try {
      const response = await fetch(
        `/api/property-types/${propertyTypeToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Property type deleted successfully!");
        fetchPropertyTypes();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete property type");
      }
    } catch (error) {
      console.error("Error deleting property type:", error);
      toast.error("Error deleting property type");
    } finally {
      setConfirmModalOpen(false);
      setPropertyTypeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmModalOpen(false);
    setPropertyTypeToDelete(null);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedPropertyType(null);
  };

  const handleModalSave = () => {
    fetchPropertyTypes();
  };

  if (loading) {
    return (
      <AdminSidebar>
        <AdminLoading message="Loading property types..." />
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Property Types
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
              Manage property categories and types
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Icon
              icon="ph:plus"
              width={18}
              height={18}
              className="sm:w-5 sm:h-5"
            />
            <span className="hidden xs:inline">Add Property Type</span>
            <span className="xs:hidden">Add Type</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Types
                </p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {propertyTypes.length}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-2 sm:p-3 rounded-full">
                <Icon
                  icon="ph:squares-four"
                  className="text-blue-600 dark:text-blue-400"
                  width={16}
                  height={16}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Types
                </p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {propertyTypes.filter((type) => type.isActive).length}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-2 sm:p-3 rounded-full">
                <Icon
                  icon="ph:check-circle"
                  className="text-green-600 dark:text-green-400"
                  width={16}
                  height={16}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Properties
                </p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {propertyTypes.reduce(
                    (sum, type) => sum + (type.propertyCount || 0),
                    0
                  )}
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-2 sm:p-3 rounded-full">
                <Icon
                  icon="ph:house"
                  className="text-purple-600 dark:text-purple-400"
                  width={16}
                  height={16}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg. Properties
                </p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {propertyTypes.length > 0
                    ? Math.round(
                        propertyTypes.reduce(
                          (sum, type) => sum + (type.propertyCount || 0),
                          0
                        ) / propertyTypes.length
                      )
                    : 0}
                </p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900 p-2 sm:p-3 rounded-full">
                <Icon
                  icon="ph:chart-bar"
                  className="text-orange-600 dark:text-orange-400"
                  width={16}
                  height={16}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Property Types Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Property Types
            </h2>
          </div>

          {propertyTypes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
              {propertyTypes.map((propertyType) => (
                <div
                  key={propertyType._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-40 sm:h-48">
                    <Image
                      src={propertyType.image}
                      alt={propertyType.name}
                      fill
                      className="object-cover"
                      unoptimized={true}
                    />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          propertyType.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {propertyType.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {propertyType.propertyCount !== undefined && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-black/50 text-white px-2 py-1 text-xs rounded-full">
                          {propertyType.propertyCount}{" "}
                          <span className="hidden xs:inline">
                            {propertyType.propertyCount === 1
                              ? "property"
                              : "properties"}
                          </span>
                          <span className="xs:hidden">
                            {propertyType.propertyCount === 1
                              ? "prop"
                              : "props"}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate pr-2">
                        {propertyType.name}
                      </h3>
                      {propertyType.icon && (
                        <Icon
                          icon={propertyType.icon}
                          className="text-gray-400 dark:text-gray-500 flex-shrink-0"
                          width={18}
                          height={18}
                        />
                      )}
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                      {propertyType.description}
                    </p>

                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <Link
                        href={`/properties/${propertyType.slug}`}
                        target="_blank"
                        className="text-primary hover:underline text-xs sm:text-sm font-medium"
                      >
                        <span className="hidden xs:inline">
                          View Properties
                        </span>
                        <span className="xs:hidden">View</span>
                      </Link>

                      <div className="flex items-center gap-3 justify-end sm:justify-start">
                        <button
                          onClick={() => handleEdit(propertyType)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                          title="Edit property type"
                        >
                          <Icon
                            icon="ph:pencil-simple"
                            width={16}
                            height={16}
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(propertyType)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Delete property type"
                        >
                          <Icon icon="ph:trash" width={16} height={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 px-4">
              <Icon
                icon="ph:squares-four"
                className="text-4xl sm:text-6xl text-gray-400 dark:text-gray-600 mx-auto mb-4"
              />
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
                No property types found.
              </p>
            </div>
          )}
        </div>

        {/* Modal */}
        <PropertyTypeModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          propertyType={selectedPropertyType}
          onSave={handleModalSave}
        />

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={confirmModalOpen}
          onConfirm={confirmDelete}
          onClose={cancelDelete}
          title="Delete Property Type"
          message={
            propertyTypeToDelete
              ? `Are you sure you want to delete "${propertyTypeToDelete.name}"? This action cannot be undone.`
              : ""
          }
          type="danger"
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </AdminSidebar>
  );
};

export default AdminPropertyTypes;
