export interface Testimonial {
  _id?: string;
  name: string;
  role: string;
  company?: string;
  message: string;
  image: string;
  rating?: number;
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backwards compatibility
  review?: string;
  position?: string;
}
