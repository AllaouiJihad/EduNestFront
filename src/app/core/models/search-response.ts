export interface SearchResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted?: boolean; // Propriété optionnelle ajoutée
    }
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size?: number;
  number?: number;
  numberOfElements?: number;
  empty: boolean;
}
