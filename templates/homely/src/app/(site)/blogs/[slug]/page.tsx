import { BlogService } from "@/services";
import { Blog } from "@/types/blog";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// Enable static generation with revalidation
export const revalidate = 300;

async function getBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    const blog = await BlogService.findBySlug(slug);

    if (!blog || !blog.isPublished) {
      return null;
    }

    // Transform the data to match the Blog type
    return {
      _id: blog._id?.toString() || "",
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
    };
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
}

async function getRelatedBlogs(
  currentSlug: string,
  tags: string[]
): Promise<Blog[]> {
  try {
    // Get related blogs with similar tags
    const { blogs } = await BlogService.findAll({
      isPublished: true,
      tags: tags.length > 0 ? tags : undefined,
      limit: 4, // Get one extra in case we need to filter out current blog
      skip: 0,
    });

    // Filter out current blog and limit to 3
    const filteredBlogs = blogs
      .filter((blog) => blog.slug !== currentSlug)
      .slice(0, 3);

    // Transform the data to match the Blog type
    return filteredBlogs.map((blog: any) => ({
      _id: blog._id?.toString() || "",
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
    console.error("Error fetching related blogs:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  const siteName = process.env.SITE_NAME || "Homely Real Estate";
  const authorName = process.env.AUTHOR_NAME || "Homely Team";

  if (!blog) {
    return {
      title: "Blog Not Found",
      description: "The requested blog post could not be found.",
      author: authorName,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${blog.title} | ${siteName}`,
    description: blog.excerpt,
    author: blog.author || authorName,
    keywords: blog.tags.join(", "),
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: [blog.coverImage],
      type: "article",
      publishedTime: blog.createdAt,
      authors: [blog.author],
      tags: blog.tags,
    },
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const relatedBlogs = await getRelatedBlogs(slug, blog.tags);

  return (
    <>
      {/* Blog Header */}
      <section className="relative !pt-24 sm:!pt-32 lg:!pt-44 pb-0">
        <div className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-0">
          <div>
            <div>
              <Link
                href="/blogs"
                className="flex items-center gap-2 sm:gap-3 text-white bg-primary py-2.5 sm:py-3 px-3 sm:px-4 rounded-full w-fit hover:bg-dark duration-300 text-sm sm:text-base"
              >
                <Icon
                  icon={"ph:arrow-left"}
                  width={16}
                  height={16}
                  className="sm:w-5 sm:h-5"
                />
                <span>Go Back</span>
              </Link>
              <h2 className="text-dark dark:text-white text-2xl sm:text-36 md:text-44 lg:text-52 leading-[1.2] font-semibold pt-6 sm:pt-7">
                {blog.title}
              </h2>
              <h6 className="text-sm sm:text-base mt-4 sm:mt-5 text-dark dark:text-white">
                {blog.excerpt}
              </h6>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 mt-8 sm:mt-10 lg:mt-12">
              <div className="flex items-center gap-3 sm:gap-4">
                <Image
                  src={blog.authorImage || "/images/users/alkesh.jpg"}
                  alt={blog.author}
                  className="bg-no-repeat bg-contain inline-block rounded-full !w-10 !h-10 sm:!w-12 sm:!h-12 object-cover"
                  width={48}
                  height={48}
                  quality={100}
                  unoptimized={true}
                />
                <div>
                  <span className="text-sm sm:text-base text-dark dark:text-white">
                    {blog.author}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-7">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Icon
                    icon={"ph:clock"}
                    width={16}
                    height={16}
                    className="sm:w-5 sm:h-5"
                  />
                  <span className="text-sm sm:text-base text-dark font-medium dark:text-white">
                    {(() => {
                      try {
                        return format(new Date(blog.createdAt), "MMM dd, yyyy");
                      } catch (error) {
                        return "Date unavailable";
                      }
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Icon
                    icon="solar:eye-outline"
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  />
                  <span className="text-xs sm:text-sm text-dark dark:text-white">
                    {blog.views} views
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Icon
                    icon="solar:clock-circle-outline"
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  />
                  <span className="text-xs sm:text-sm text-dark dark:text-white">
                    {blog.readTime} min
                  </span>
                </div>
                {blog.tags && blog.tags.length > 0 && (
                  <div className="py-1.5 sm:py-2.5 px-3 sm:px-5 bg-dark/5 rounded-full dark:bg-white/15">
                    <p className="text-xs sm:text-sm font-semibold text-dark dark:text-white">
                      {blog.tags[0]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="z-20 mt-8 sm:mt-10 lg:mt-12 overflow-hidden rounded">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              width={1170}
              height={766}
              quality={100}
              className="h-full w-full object-cover object-center rounded-2xl sm:rounded-3xl"
            />
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="!pt-0 px-4">
        <div className="container max-w-8xl mx-auto px-4">
          <div className="-mx-4 flex flex-wrap justify-center">
            <div className="blog-details markdown xl:pr-10">
              <div dangerouslySetInnerHTML={{ __html: blog.content }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Blogs */}
      {relatedBlogs.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container max-w-7xl mx-auto px-5 2xl:px-0">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-dark dark:text-white mb-4">
                Related Articles
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Discover more insights and tips
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {relatedBlogs.map((relatedBlog) => (
                <Link
                  key={relatedBlog._id}
                  href={`/blogs/${relatedBlog.slug}`}
                  className="group block h-full"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
                    <div className="overflow-hidden">
                      <Image
                        src={relatedBlog.coverImage}
                        alt={relatedBlog.title}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                        width={400}
                        height={240}
                        unoptimized={true}
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold text-dark dark:text-white group-hover:text-primary transition-colors duration-300 mb-2 line-clamp-2 min-h-[3.5rem]">
                        {relatedBlog.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
                        {relatedBlog.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto">
                        <span>
                          {(() => {
                            try {
                              return format(
                                new Date(relatedBlog.createdAt),
                                "MMM dd, yyyy"
                              );
                            } catch (error) {
                              return "Date unavailable";
                            }
                          })()}
                        </span>
                        <span>{relatedBlog.readTime} min read</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
