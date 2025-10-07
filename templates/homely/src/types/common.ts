// Global type definitions for common interfaces
export interface PropertyFilters {
  search: string;
  status: string;
  propertyType?: string;
  featured: boolean;
}

export interface PaginationMeta {
  current: number;
  pages: number;
  total: number;
  limit: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ChartDataItem {
  name: string;
  value: number;
  fill?: string;
}

// Common event types
export type ChangeEvent = React.ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;
export type FormEvent = React.FormEvent<HTMLFormElement>;
export type MouseEvent = React.MouseEvent<HTMLButtonElement>;

// API parameter types
export interface PageParams {
  params: Promise<{ id?: string; slug?: string; type?: string }>;
}

// Tooltip formatter type
export type TooltipFormatter = (value: number) => [number, string];
