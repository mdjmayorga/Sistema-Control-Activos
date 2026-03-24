import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loan-request',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './loan-request.html',
  styleUrl: './loan-request.css'
})
export class LoanRequestComponent {
  loanForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loanForm = this.fb.group({
      grupoTopografia: ['', Validators.required],
      cuadrilla: ['', Validators.required],
      razonPrestamo: ['', Validators.required],
      activo: ['', Validators.required],
      numeroSerie: ['', Validators.pattern(/^[A-Za-z0-9-]+$/)]
    });
  }

  onSubmit() {
    if (this.loanForm.valid) {
      console.log('Formulario enviado:', this.loanForm.value);
      alert('Solicitud registrada correctamente');
      this.loanForm.reset();
    } else {
      this.loanForm.markAllAsTouched();
    }
  }

  onCancel() {
  this.loanForm.reset();
}
}

