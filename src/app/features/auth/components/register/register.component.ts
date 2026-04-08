import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirebaseError } from '@angular/fire/app';

import { AuthService } from '../../services/auth.service';
import { passwordMatchValidator } from '../../../../shared/validators/password-match.validator';

const EMAIL_DOMAINS = ['@estudiantec.cr', '@itcr.ac.cr'] as const;
type EmailDomain = (typeof EMAIL_DOMAINS)[number];

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly showTermsModal = signal(false);

  protected readonly registerForm = this.fb.nonNullable.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      emailUser: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+$/)]],
      emailDomain: ['@estudiantec.cr' as EmailDomain, [Validators.required]],
      studentId: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
    },
    { validators: passwordMatchValidator },
  );

  protected readonly emailDomains = EMAIL_DOMAINS;

  protected readonly isStaffEmail = signal(false);

  constructor() {
    this.registerForm.controls.emailDomain.valueChanges.subscribe((domain) => {
      const isStaff = domain === '@itcr.ac.cr';
      this.isStaffEmail.set(isStaff);

      const studentIdControl = this.registerForm.controls.studentId;

      if (isStaff) {
        studentIdControl.clearValidators();
        studentIdControl.setValue('');
      } else {
        studentIdControl.setValidators([Validators.required, Validators.pattern(/^\d{10}$/)]);
      }

      studentIdControl.updateValueAndValidity();
    });
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  protected openTermsModal(): void {
    this.showTermsModal.set(true);
  }

  protected closeTermsModal(): void {
    this.showTermsModal.set(false);
  }

  protected async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { fullName, emailUser, emailDomain, studentId, password } =
      this.registerForm.getRawValue();

    const email = `${emailUser}${emailDomain}`;

    try {
      await this.authService.register({
        fullName,
        studentId: this.isStaffEmail() ? 'N/A' : studentId,
        email,
        password,
      });
      this.router.navigate(['/']);
    } catch (error) {
      this.errorMessage.set(this.mapFirebaseError(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private mapFirebaseError(error: unknown): string {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          return 'Este correo ya esta registrado. Intenta iniciar sesion.';
        case 'auth/weak-password':
          return 'La contrasena es muy debil. Usa al menos 8 caracteres.';
        case 'auth/invalid-email':
          return 'El correo electronico no es valido.';
        case 'auth/network-request-failed':
          return 'Error de conexion. Verifica tu conexion a internet.';
        default:
          return 'Ocurrio un error inesperado. Intenta de nuevo.';
      }
    }
    return 'Ocurrio un error inesperado. Intenta de nuevo.';
  }
}
