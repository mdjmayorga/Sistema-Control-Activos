import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type DamagedLoanSeverity = 'severo' | 'moderado' | 'leve';

export interface DamagedLoanCardData {
	id: string;
	activo: string;
	usuarioNombre: string;
	fechaReporte: string;
	descripcionDanio: string;
	severidad: DamagedLoanSeverity;
	imagenUrl?: string;
	imagenAlt?: string;
}

@Component({
	selector: 'app-damaged-loan-card',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './damaged-loan-card.html',
	styleUrl: './damaged-loan-card.css',
})
export class DamagedLoanCard {
	@Input({ required: true }) loan!: DamagedLoanCardData;
	@Output() resolver = new EventEmitter<DamagedLoanCardData>();

	emitResolve(): void {
		this.resolver.emit(this.loan);
	}


	showPreview = false;

	openPreview(): void {
		this.showPreview = true;
	}

	closePreview(): void {
		this.showPreview = false;
	}

	onPreviewKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			event.preventDefault();
			this.closePreview();
		}
	}
}