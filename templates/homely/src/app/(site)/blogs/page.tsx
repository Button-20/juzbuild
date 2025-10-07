import BlogList from "@/components/Blog";
import HeroSub from "@/components/shared/HeroSub";
import { Metadata } from "next";

// Enable static generation with revalidation for better performance
export const revalidate = 300; // Revalidate every 5 minutes

export const metadata: Metadata = {
  title: "Blog Grids | Homely ",
};

const Blog = () => {
  return (
    <>
      <HeroSub
        title="Real estate insights."
        description="Stay ahead in the property market with expert advice and updates."
        badge="Blog"
      />
      <BlogList />
    </>
  );
};

export default Blog;
