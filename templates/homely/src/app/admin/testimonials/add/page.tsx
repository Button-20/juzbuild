"use client";

import AdminSidebar from "@/components/Admin/AdminSidebar";
import TestimonialForm from "@/components/Admin/TestimonialForm";

export default function AddTestimonialPage() {
  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Add New Testimonial
            </h1>
          </div>
        </div>

        <TestimonialForm />
      </div>
    </AdminSidebar>
  );
}
