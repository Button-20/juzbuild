export interface Category {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  link: string;
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}
