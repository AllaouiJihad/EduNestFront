import {SchoolStatus} from "./school";

export interface SchoolSearchResponse {
  id: number;
  name: string;
  city: string;
  postalCode: string;
  status: SchoolStatus;
  categoryName: string;
  averageRating: number;
  reviewCount: number;
  favoriteCount: number;
}
