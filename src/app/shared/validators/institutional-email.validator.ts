import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const INSTITUTIONAL_DOMAINS = ['estudiantec.cr', 'itcr.ac.cr'];

/**
 * AU003 - Validador de dominio institucional.
 * Acepta únicamente correos @estudiantec.cr y @itcr.ac.cr.
 */
export function institutionalEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const email: string = control.value;
    if (!email) return null;

    const atIndex = email.indexOf('@');
    if (atIndex === -1) return { institutionalEmail: true };

    const domain = email.slice(atIndex + 1).toLowerCase();
    const isValid = INSTITUTIONAL_DOMAINS.includes(domain);

    return isValid ? null : { institutionalEmail: { domain } };
  };
}