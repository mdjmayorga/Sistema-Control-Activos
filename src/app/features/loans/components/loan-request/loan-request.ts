import { Component, inject, DestroyRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { map } from 'rxjs';
import { LoanService } from '../../services/loan.service';
import { PageLayout } from '../../../../layout/components/page-layout/page-layout';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmModal } from '../../../../shared/components/confirm-modal/confirm-modal';
import { EQUIPMENT_OPTIONS, CREW_OPTIONS, TOPOGRAPHY_GROUP_OPTIONS } from '../../../../core/constants/loan-options';
import { Asset } from '../../../../core/models/asset.model';

const SERIAL_PATTERN = /^[A-Za-z0-9-]+$/;

@Component({
  selector: 'app-loan-request',
  standalone: true,
  imports: [PageLayout, ReactiveFormsModule, CommonModule, ConfirmModal],
  templateUrl: './loan-request.html',
  styleUrl: './loan-request.css'
})
export class LoanRequestComponent implements OnInit {
  private readonly firestore = inject(Firestore);
  private readonly destroyRef = inject(DestroyRef);

  titulo = 'Solicitar Préstamo';
  descripcion = 'Complete el formulario para registrar un nuevo préstamo de activo';
  modalConfirmacionAbierto = false;
  procesandoSolicitud = false;
  solicitudCompletada = false;
  loanForm: FormGroup;

  private static readonly defaultAssets: Asset[] = EQUIPMENT_OPTIONS.map((nombre) => ({
    nombre,
    esCuantitativo: false,
  }));

  equipmentAssets: Asset[] = LoanRequestComponent.defaultAssets;
  readonly crewOptions = CREW_OPTIONS;
  readonly groupOptions = TOPOGRAPHY_GROUP_OPTIONS;

  activosSeleccionados: string[] = [];
  activosTouched = false;
  numerosSerie: Record<string, string> = {};
  cantidades: Record<string, number> = {};

  constructor(
    private fb: FormBuilder,
    private loanService: LoanService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loanForm = this.fb.group({
      grupoTopografia: ['', Validators.required],
      cuadrilla: ['', Validators.required],
      razonPrestamo: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const ref = collection(this.firestore, 'activos');
    (collectionData(ref, { idField: 'id' }) as import('rxjs').Observable<Asset[]>)
      .pipe(
        map((assets) => assets.sort((a, b) => a.nombre.localeCompare(b.nombre))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (activos) => {
          this.equipmentAssets = activos.length > 0
            ? activos
            : LoanRequestComponent.defaultAssets;
        },
        error: () => {
          this.equipmentAssets = LoanRequestComponent.defaultAssets;
        },
      });
  }

  getAsset(nombre: string): Asset | undefined {
    return this.equipmentAssets.find((a) => a.nombre === nombre);
  }

  esCuantitativo(equipo: string): boolean {
    return this.getAsset(equipo)?.esCuantitativo ?? false;
  }

  getCantidad(equipo: string): number {
    return this.cantidades[equipo] ?? 1;
  }

  incrementarCantidad(equipo: string): void {
    this.cantidades[equipo] = this.getCantidad(equipo) + 1;
  }

  decrementarCantidad(equipo: string): void {
    const actual = this.getCantidad(equipo);
    if (actual > 1) {
      this.cantidades[equipo] = actual - 1;
    }
  }

  get activosInvalid(): boolean {
    return this.activosTouched && this.activosSeleccionados.length === 0;
  }

  isActivoSelected(equipo: string): boolean {
    return this.activosSeleccionados.includes(equipo);
  }

  toggleActivo(equipo: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.activosSeleccionados.push(equipo);
      if (this.esCuantitativo(equipo)) {
        this.cantidades[equipo] = 1;
      }
    } else {
      this.activosSeleccionados = this.activosSeleccionados.filter(a => a !== equipo);
      delete this.numerosSerie[equipo];
      delete this.cantidades[equipo];
    }
    this.activosTouched = true;
  }

  getNumeroSerie(equipo: string): string {
    return this.numerosSerie[equipo] ?? '';
  }

  setNumeroSerie(equipo: string, event: Event): void {
    this.numerosSerie[equipo] = (event.target as HTMLInputElement).value;
  }

  hasSerialError(equipo: string): boolean {
    const val = this.numerosSerie[equipo];
    return !!val && !SERIAL_PATTERN.test(val);
  }

  private get hasAnySerialError(): boolean {
    return this.activosSeleccionados.some(a => this.hasSerialError(a));
  }

  onSubmit(): void {
    this.activosTouched = true;

    if (this.loanForm.invalid || this.activosSeleccionados.length === 0 || this.hasAnySerialError) {
      this.loanForm.markAllAsTouched();
      return;
    }

    this.procesandoSolicitud = false;
    this.solicitudCompletada = false;
    this.modalConfirmacionAbierto = true;
  }

  cancelarConfirmacion(): void {
    if (this.procesandoSolicitud || this.solicitudCompletada) {
      return;
    }

    this.modalConfirmacionAbierto = false;
  }

  async confirmarSolicitud(): Promise<void> {
    if (this.procesandoSolicitud || this.solicitudCompletada) {
      return;
    }

    this.procesandoSolicitud = true;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.procesandoSolicitud = false;
      this.modalConfirmacionAbierto = false;
      return;
    }

    const usuarioNombre = await this.authService.getUserDisplayName(
      currentUser.uid,
      currentUser.displayName,
      currentUser.email,
    );

    const fechaPrestamo = new Date().toISOString();
    const grupoId = crypto.randomUUID();

    try {
      const promesas = this.activosSeleccionados.map(activo => {
        const serie = this.numerosSerie[activo]?.trim() || '';
        const cantidad = this.esCuantitativo(activo) ? this.getCantidad(activo) : undefined;
        const prestamo = {
          ...this.loanForm.value,
          activo,
          estado: 'activo' as const,
          fechaPrestamo,
          usuarioId: currentUser.uid,
          usuarioNombre,
          correoInstitucional: currentUser.email ?? 'N/A',
          grupoPrestamoId: grupoId,
          activosGrupo: [...this.activosSeleccionados],
          ...(serie ? { numeroSerie: serie } : {}),
          ...(cantidad != null ? { cantidad } : {}),
        };
        return this.loanService.crearPrestamo(prestamo);
      });

      await Promise.all(promesas);

      this.procesandoSolicitud = false;
      this.solicitudCompletada = true;
      this.loanForm.reset();
      this.activosSeleccionados = [];
      this.activosTouched = false;
      this.numerosSerie = {};
      this.cantidades = {};
      await this.esperar(900);

      const rutaMisPrestamos = this.router.url.startsWith('/admin')
        ? '/admin/mis-prestamos'
        : '/usuario/mis-prestamos';

      this.modalConfirmacionAbierto = false;
      await this.router.navigate([rutaMisPrestamos]);
    } catch (error) {
      this.procesandoSolicitud = false;
      this.modalConfirmacionAbierto = false;
      console.error('Error al registrar préstamo:', error);
    }
  }

  get modalTitulo(): string {
    if (this.solicitudCompletada) {
      return 'Préstamo realizado';
    }

    if (this.procesandoSolicitud) {
      return 'Registrando préstamo';
    }

    return 'Confirmar préstamo';
  }

  get modalMensaje(): string {
    if (this.solicitudCompletada) {
      return 'Se realizó el préstamo';
    }

    if (this.procesandoSolicitud) {
      return 'Realizando préstamo...';
    }

    const count = this.activosSeleccionados.length;
    const activos = this.activosSeleccionados
      .map(a => {
        const cant = this.esCuantitativo(a) ? this.getCantidad(a) : 0;
        return cant > 1 ? `${a} (x${cant})` : a;
      })
      .join(', ');
    return `¿Desea registrar el préstamo de ${count} activo${count > 1 ? 's' : ''}? (${activos})`;
  }

  get textoConfirmarModal(): string {
    if (this.solicitudCompletada) {
      return 'Listo';
    }

    if (this.procesandoSolicitud) {
      return 'Guardando...';
    }

    return 'Confirmar';
  }

  private async esperar(ms: number): Promise<void> {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  onCancel() {
    this.loanForm.reset();
    this.activosSeleccionados = [];
    this.activosTouched = false;
    this.numerosSerie = {};
    this.cantidades = {};
  }
}
