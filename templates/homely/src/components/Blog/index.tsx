import BlogCard from "@/components/shared/Blog/blogCard";
import { BlogService } from "@/services";
import { Blog } from "@/types/blog";
import React from "react";

async function getBlogs(): Promise<Blog[]> {
  try {
    const { blogs } = await BlogService.findAll({
      isPublished: true,
      limit: 20,
      skip: 0,
    });

    // Transform the data to match the Blog type
    return blogs.map((blog: any) => ({
      _id: blog._id?.toString(),
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      excerpt: blog.excerpt || "",
      coverImage: blog.coverImage || "",
      author: blog.author || "Blog Author",
      authorImage: blog.authorImage || "",
      tags: blog.tags || [],
      isPublished: blog.isPublished,
      views: blog.views || 0,
      readTime: blog.readTime || 1,
      createdAt:
        blog.createdAt instanceof Date
          ? blog.createdAt.toISOString()
          : new Date(blog.createdAt || Date.now()).toISOString(),
      updatedAt:
        blog.updatedAt instanceof Date
          ? blog.updatedAt.toISOString()
          : new Date(blog.updatedAt || Date.now()).toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

const BlogList: React.FC = async () => {
  const blogs = await getBlogs();

  if (blogs.length === 0) {
    return (
      <section className="pt-0!">
        <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No blogs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back later for new blog posts.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-0!">
      <div className="container max-w-8xl mx-auto px-5 2xl:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 items-stretch">
          {blogs.map((blog) => (
            <div key={blog._id} className="w-full h-full">
              <BlogCard blog={blog} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogList;
