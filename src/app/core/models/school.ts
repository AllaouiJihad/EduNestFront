export interface School {
  id: number;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  website: string;
  description: string;
  categoryName: string;
  averageRating: number;
  reviewCount: number;
  imageUrl?: string;
}
