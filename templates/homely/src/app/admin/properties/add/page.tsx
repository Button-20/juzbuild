"use client";

import AdminSidebar from "@/components/Admin/AdminSidebar";
import PropertyForm from "@/components/Admin/PropertyForm";

export default function AddPropertyPage() {
  return (
    <AdminSidebar>
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Add New Property
            </h1>
          </div>
        </div>
        <PropertyForm />
      </div>
    </AdminSidebar>
  );
}
