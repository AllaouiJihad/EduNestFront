export interface ContactRequest {
  id: number;
  subject: string;
  message: string;
  contactStatus: string;
  createdAt: string;
  memberId: number;
  schoolId: number;
}
