import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, doc, deleteDoc } from '@angular/fire/firestore';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageLayout } from '../../../../layout/components/page-layout/page-layout';
import { ConfirmModal } from '../../../../shared/components/confirm-modal/confirm-modal';
import { AssetService } from '../../services/asset.service';
import { Asset } from '../../../../core/models/asset.model';
import { EQUIPMENT_OPTIONS } from '../../../../core/constants/loan-options';

@Component({
  selector: 'app-asset-management',
  standalone: true,
  imports: [CommonModule, FormsModule, PageLayout, ConfirmModal],
  templateUrl: './asset-management.html',
  styleUrl: './asset-management.css',
})
export class AssetManagementPage implements OnInit {
  private readonly assetService = inject(AssetService);
  private readonly firestore = inject(Firestore);
  private readonly destroyRef = inject(DestroyRef);
  private seedDone = false;

  activos: Asset[] = [];
  nuevoNombre = '';
  esCuantitativo = false;
  guardando = false;
  errorMensaje = '';
  cargando = true;

  modalEliminarAbierto = false;
  activoAEliminar: Asset | null = null;
  eliminando = false;

  ngOnInit(): void {
    this.assetService
      .obtenerActivos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((activos) => {
        if (activos.length === 0 && !this.seedDone) {
          this.seedDone = true;
          void this.seedDefaults();
        }
        this.activos = activos;
        this.cargando = false;
      });
  }

  private async seedDefaults(): Promise<void> {
    try {
      for (const nombre of EQUIPMENT_OPTIONS) {
        await this.assetService.agregarActivo({ nombre, esCuantitativo: false });
      }
    } catch {
      this.errorMensaje = 'Error al cargar los activos por defecto.';
    }
  }

  async agregarActivo(): Promise<void> {
    const nombre = this.nuevoNombre.trim();
    if (!nombre) {
      this.errorMensaje = 'Debe ingresar un nombre para el activo.';
      return;
    }

    const duplicado = this.activos.some(
      (a) => a.nombre.toLowerCase() === nombre.toLowerCase()
    );
    if (duplicado) {
      this.errorMensaje = 'Ya existe un activo con ese nombre.';
      return;
    }

    this.guardando = true;
    this.errorMensaje = '';

    try {
      await this.assetService.agregarActivo({
        nombre,
        esCuantitativo: this.esCuantitativo,
      });
      this.nuevoNombre = '';
      this.esCuantitativo = false;
    } catch {
      this.errorMensaje = 'Error al agregar el activo. Intente de nuevo.';
    } finally {
      this.guardando = false;
    }
  }

  solicitarEliminar(activo: Asset): void {
    this.activoAEliminar = activo;
    this.modalEliminarAbierto = true;
  }

  cancelarEliminar(): void {
    if (this.eliminando) return;
    this.modalEliminarAbierto = false;
    this.activoAEliminar = null;
  }

  async confirmarEliminar(): Promise<void> {
    if (!this.activoAEliminar?.id || this.eliminando) return;

    this.eliminando = true;
    try {
      const ref = doc(this.firestore, 'activos', this.activoAEliminar.id);
      await deleteDoc(ref);
    } catch {
      this.errorMensaje = 'Error al eliminar el activo.';
    } finally {
      this.eliminando = false;
      this.modalEliminarAbierto = false;
      this.activoAEliminar = null;
    }
  }
}
