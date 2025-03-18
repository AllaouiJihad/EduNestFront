// src/app/shared/validators/password-validator.ts

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class PasswordValidators {
  /**
   * Validator qui vérifie si le mot de passe est assez fort
   * Exige au moins 8 caractères, une lettre minuscule, une lettre majuscule et un chiffre
   */
  static strong(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: string = control.value || '';

      if (!value) {
        return null;
      }

      const hasMinLength = value.length >= 8;
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);

      const valid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;

      if (!valid) {
        return {
          strongPassword: {
            hasMinLength,
            hasUpperCase,
            hasLowerCase,
            hasNumber
          }
        };
      }

      return null;
    };
  }

  /**
   * Validator qui vérifie si les deux mots de passe correspondent
   */
  static matchPasswords(passwordControlName: string, confirmPasswordControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get(passwordControlName);
      const confirmPassword = formGroup.get(confirmPasswordControlName);

      if (!password || !confirmPassword) {
        return null;
      }

      if (confirmPassword.errors && !confirmPassword.errors['passwordMismatch']) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        confirmPassword.setErrors(null);
        return null;
      }
    };
  }
}
