export interface PropertyType {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon?: string;
  isActive?: boolean;
  propertyCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
