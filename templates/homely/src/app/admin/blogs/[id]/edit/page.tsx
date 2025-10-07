"use client";

import AdminSidebar from "@/components/Admin/AdminSidebar";
import BlogForm from "@/components/Admin/BlogForm";
import { use } from "react";

interface EditBlogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = use(params);

  return (
    <AdminSidebar>
      <BlogForm blogId={id} isEdit={true} />
    </AdminSidebar>
  );
}
