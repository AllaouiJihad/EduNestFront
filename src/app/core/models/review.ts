export interface Review {
  id: number;
  content: string;
  rating: number;
  createdAt: string;
  schoolId: number;
  memberId: number;
  memberName?: string;
}
