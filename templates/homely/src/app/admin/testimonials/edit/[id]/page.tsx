"use client";

import AdminSidebar from "@/components/Admin/AdminSidebar";
import TestimonialForm from "@/components/Admin/TestimonialForm";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  company?: string;
  message: string;
  image: string;
  rating: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonial();
  }, [id]);

  const fetchTestimonial = async () => {
    try {
      const response = await fetch(`/api/admin/testimonials/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTestimonial(data.testimonial);
      } else {
        toast.error("Failed to fetch testimonial");
        router.push("/admin/testimonials");
      }
    } catch (error) {
      toast.error("Error fetching testimonial");
      router.push("/admin/testimonials");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminSidebar>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  if (!testimonial) {
    return (
      <AdminSidebar>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Testimonial Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The testimonial you&apos;re looking for doesn&apos;t exist or
                has been deleted.
              </p>
              <button
                onClick={() => router.push("/admin/testimonials")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Back to Testimonials
              </button>
            </div>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Testimonial
            </h1>
            <button
              onClick={() => router.push("/admin/testimonials")}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Testimonials
            </button>
          </div>
        </div>

        <TestimonialForm
          initialData={testimonial}
          isEdit={true}
          testimonialId={id}
        />
      </div>
    </AdminSidebar>
  );
}
