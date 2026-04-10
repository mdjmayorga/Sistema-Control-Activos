import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Cross-field validator that checks if `password` and `confirmPassword` match.
 */
export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
}
