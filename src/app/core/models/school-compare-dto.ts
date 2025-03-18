export interface SchoolCompareDTO {
  id: number;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  categoryName: string;
  averageRating: number;
  reviewCount: number;
  website: string;
  phoneNumber: string;
  email: string;
  imageUrl?: string;
}
