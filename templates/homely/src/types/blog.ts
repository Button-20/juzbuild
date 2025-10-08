export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  authorImage: string;
  tags: string[];
  isPublished: boolean;
  views: number;
  readTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  authorImage: string;
  tags: string[];
  isPublished: boolean;
}
