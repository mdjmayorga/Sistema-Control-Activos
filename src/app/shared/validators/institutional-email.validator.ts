import { AbstractControl, ValidationErrors } from '@angular/forms';

const ALLOWED_DOMAINS = ['@estudiantec.cr', '@itcr.ac.cr'];

/**
 * Validates that the email belongs to an institutional ITCR domain.
 */
export function institutionalEmailValidator(control: AbstractControl): ValidationErrors | null {
  const email = control.value as string;

  if (!email) {
    return null;
  }

  const isValid = ALLOWED_DOMAINS.some((domain) => email.toLowerCase().endsWith(domain));

  return isValid ? null : { institutionalEmail: true };
}
