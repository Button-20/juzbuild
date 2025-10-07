"use client";

import AdminSidebar from "@/components/Admin/AdminSidebar";
import PropertyForm from "@/components/Admin/PropertyForm";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Property {
  _id: string;
  name: string;
  slug: string;
  location: string;
  price: number;
  currency: string;
  propertyType: {
    _id: string;
    name: string;
  };
  status: string;
  beds: number;
  baths: number;
  area: number;
  description: string;
  isFeatured: boolean;
  isActive: boolean;
  images: Array<{
    src: string;
    alt: string;
    isMain: boolean;
  }>;
  features: string[];
  amenities: string[];
}

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/admin/properties/${id}`);
      if (response.ok) {
        const data = await response.json();
        console.log("EditPropertyPage - fetched property:", data);
        console.log(
          "EditPropertyPage - property.propertyType:",
          data.propertyType
        );
        setProperty(data);
      } else {
        toast.error("Failed to fetch property");
        router.push("/admin/properties");
      }
    } catch {
      toast.error("Error fetching property");
      router.push("/admin/properties");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminSidebar>
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-black shadow rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  if (!property) {
    return (
      <AdminSidebar>
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-black shadow rounded-lg p-4 sm:p-6">
            <div className="text-center py-12">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Property Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base">
                The property you&apos;re looking for doesn&apos;t exist or has
                been deleted.
              </p>
              <button
                onClick={() => router.push("/admin/properties")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm sm:text-base"
              >
                Back to Properties
              </button>
            </div>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Edit Property
            </h1>
            <button
              onClick={() => router.push("/admin/properties")}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm sm:text-base self-start sm:self-auto"
            >
              ← Back to Properties
            </button>
          </div>
        </div>

        <PropertyForm
          key={property?._id || "new"}
          initialData={property}
          isEdit={true}
          propertyId={id}
        />
      </div>
    </AdminSidebar>
  );
}
