export interface SchoolSearchRequest {
  name?: string;
  city?: string;
  postalCode?: string;
  categoryId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}
