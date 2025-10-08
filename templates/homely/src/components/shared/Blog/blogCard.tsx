import { Blog } from "@/types/blog";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

const BlogCard: FC<{ blog: Blog }> = ({ blog }) => {
  const {
    title,
    coverImage,
    createdAt,
    slug,
    tags,
    author,
    authorImage,
    readTime,
    excerpt,
  } = blog;

  // Safe date formatting function
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return "Date not available";
      }
      return format(date, "MMM dd, yyyy");
    } catch (error) {
      return "Date not available";
    }
  };

  return (
    <Link
      href={`/blogs/${slug}`}
      aria-label={`Read blog post: ${title}`}
      className="group block h-full"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Blog Image */}
        <div className="overflow-hidden rounded-t-2xl flex-shrink-0">
          <Image
            src={coverImage}
            alt={title}
            className="transition-transform duration-300 group-hover:scale-110 w-full h-48 sm:h-52 lg:h-48 object-cover"
            width={400}
            height={240}
            unoptimized={true}
          />
        </div>

        {/* Blog Content */}
        <div className="p-4 sm:p-5 lg:p-6 flex flex-col flex-grow">
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="mb-3 flex-shrink-0">
              <span className="inline-block py-1 px-2 sm:px-3 bg-primary/10 text-primary text-xs sm:text-sm font-medium rounded-full">
                {tags[0]}
              </span>
            </div>
          )}

          {/* Title */}
          <h3
            className="text-lg sm:text-xl font-semibold text-dark dark:text-white group-hover:text-primary transition-colors duration-300 mb-2 sm:mb-3 line-clamp-2 flex-shrink-0 leading-tight"
            style={{ minHeight: "3rem" }}
          >
            {title}
          </h3>

          {/* Excerpt */}
          {excerpt && (
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
              {excerpt}
            </p>
          )}

          {/* Author and Meta */}
          <div className="flex items-center justify-between mt-auto flex-shrink-0 gap-2">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <Image
                src={authorImage || "/images/users/alkesh.jpg"}
                alt={author}
                width={32}
                height={32}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-dark dark:text-white truncate">
                  {author}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(createdAt)}
                </p>
              </div>
            </div>

            {/* Read Time */}
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 flex-shrink-0">
              <Icon
                icon="solar:clock-circle-outline"
                className="w-3 h-3 sm:w-4 sm:h-4"
              />
              <span className="text-xs whitespace-nowrap">{readTime} min</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
