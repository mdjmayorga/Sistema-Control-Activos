import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordMatchValidator(
  passwordField?: string,
  confirmField?: string,
): ValidatorFn {
  const pwKey = passwordField ?? 'password';
  const cfKey = confirmField ?? 'confirmPassword';

  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(pwKey)?.value;
    const confirmPassword = group.get(cfKey)?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}
