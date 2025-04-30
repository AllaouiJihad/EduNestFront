export interface SchoolSearchRequest {
  name?: string;
  city?: string;
  postalCode?: string;
  categoryId?: number;
  minRating?: number;
  maxRating?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}
