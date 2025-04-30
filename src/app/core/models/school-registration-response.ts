import {RequestStatus} from "./school-registration-request";

export interface SchoolRegistrationResponse {
  id: number;
  schoolName: string;
  status: RequestStatus;
  submittedAt: string;
  reviewedAt?: string;
  adminReviewNotes?: string;
  schoolAddress?: string;
  schoolPostalCode?: string;
  schoolCity?: string;
  schoolPhoneNumber?: string;
  schoolEmail?: string;
  schoolWebsite?: string;
  schoolDescription?: string;
  categoryId?: number;
  additionalInfo?: string;

}
