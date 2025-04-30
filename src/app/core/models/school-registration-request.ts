export interface SchoolRegistrationRequest {
  schoolName: string;
  schoolAddress: string;
  schoolPostalCode: string;
  schoolCity: string;
  schoolPhoneNumber: string;
  schoolEmail: string;
  schoolWebsite?: string;
  schoolDescription: string;
  categoryId: number;
  additionalInfo?: string;
}
export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}
