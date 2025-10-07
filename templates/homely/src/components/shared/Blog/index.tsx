"use client";

import BlogCard from "@/components/shared/Blog/blogCard";
import { Blog } from "@/types/blog";
import { Icon } from "@iconify/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const BlogSmall: React.FC = () => {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("/api/blogs?limit=3");
        if (response.ok) {
          const data = await response.json();
          setPosts(data.blogs || []);
        } else {
          console.error("Failed to fetch blogs");
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container max-w-8xl mx-auto px-4 sm:px-5 2xl:px-0">
          <div className="flex justify-between md:items-end items-start mb-8 sm:mb-10 lg:mb-12 md:flex-row flex-col gap-4 sm:gap-6 md:gap-0">
            <div className="flex-1">
              <p className="text-dark/75 dark:text-white/75 text-sm sm:text-base font-semibold flex gap-2 mb-3 sm:mb-4">
                <Icon
                  icon="ph:house-simple-fill"
                  className="text-xl sm:text-2xl text-primary"
                  aria-label="Home icon"
                />
                Blog
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-40 xl:text-52 font-medium dark:text-white mb-2 sm:mb-3">
                Real estate insights
              </h2>
              <p className="text-dark/50 dark:text-white/50 text-sm sm:text-base leading-relaxed">
                Stay ahead in the property market with expert advice and updates
              </p>
            </div>
            <Link
              href="/blogs"
              className="bg-dark dark:bg-white text-white dark:text-dark py-3 sm:py-4 px-6 sm:px-8 rounded-full hover:bg-primary dark:hover:bg-primary duration-300 text-sm sm:text-base font-medium whitespace-nowrap self-start md:self-auto"
              aria-label="Read all blog articles"
            >
              Read all articles
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden h-full animate-pulse">
                  <div className="h-48 sm:h-52 lg:h-48 bg-gray-300 dark:bg-gray-600"></div>
                  <div className="p-4 sm:p-6">
                    <div className="h-3 sm:h-4 bg-gray-300 dark:bg-gray-600 rounded mb-3 sm:mb-4 w-3/4"></div>
                    <div className="h-5 sm:h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-full"></div>
                    <div className="h-3 sm:h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container max-w-8xl mx-auto px-4 sm:px-5 2xl:px-0">
        <div className="flex justify-between md:items-end items-start mb-8 sm:mb-10 lg:mb-12 md:flex-row flex-col gap-4 sm:gap-6 md:gap-0">
          <div className="flex-1">
            <p className="text-dark/75 dark:text-white/75 text-sm sm:text-base font-semibold flex gap-2 mb-3 sm:mb-4">
              <Icon
                icon="ph:house-simple-fill"
                className="text-xl sm:text-2xl text-primary"
                aria-label="Home icon"
              />
              Blog
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-40 xl:text-52 font-medium dark:text-white mb-2 sm:mb-3">
              Real estate insights
            </h2>
            <p className="text-dark/50 dark:text-white/50 text-sm sm:text-base leading-relaxed">
              Stay ahead in the property market with expert advice and updates
            </p>
          </div>
          <Link
            href="/blogs"
            className="bg-dark dark:bg-white text-white dark:text-dark py-3 sm:py-4 px-6 sm:px-8 rounded-full hover:bg-primary dark:hover:bg-primary duration-300 text-sm sm:text-base font-medium whitespace-nowrap self-start md:self-auto"
            aria-label="Read all blog articles"
          >
            Read all articles
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {posts.map((blog, i) => (
            <div key={i} className="w-full">
              <BlogCard blog={blog} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSmall;
