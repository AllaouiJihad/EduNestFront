export interface PasswordResetRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
