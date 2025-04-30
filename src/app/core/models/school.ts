import {SchoolImage} from "./school-image";
import {Review} from "./review";

export interface School {
  id: number;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  phoneNumber: string;
  email: string;
  website: string;
  description: string;
  status: SchoolStatus;
  categoryId: number;
  categoryName?: string;
  averageRating?: number;
  reviewCount?: number;
  favoriteCount?: number;
}
export enum SchoolStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}
