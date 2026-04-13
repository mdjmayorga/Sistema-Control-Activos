import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  query,
  where,
  updateDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Loan } from '../../../core/models/loan.model';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private firestore = inject(Firestore);

  async crearPrestamo(prestamo: Loan) {
    const prestamosRef = collection(this.firestore, 'prestamos');
    return await addDoc(prestamosRef, prestamo);
  }

  obtenerPrestamosActivos(): Observable<Loan[]> {
    const prestamosRef = collection(this.firestore, 'prestamos');
    const prestamosActivosQuery = query(prestamosRef, where('estado', '==', 'activo'));

    return collectionData(prestamosActivosQuery, { idField: 'id' }) as Observable<Loan[]>;
  }

  obtenerPrestamosActivosByID(usuarioId: string): Observable<Loan[]> {
    const prestamosRef = collection(this.firestore, 'prestamos');
    const prestamosActivosQuery = query(
      prestamosRef,
      where('estado', '==', 'activo'),
      where('usuarioId', '==', usuarioId)
    );

    return collectionData(prestamosActivosQuery, { idField: 'id' }) as Observable<Loan[]>;
  }

  async marcarPrestamoComoDevuelto(prestamoId: string): Promise<void> {
    const prestamoRef = doc(this.firestore, 'prestamos', prestamoId);
    await updateDoc(prestamoRef, {
      estado: 'devuelto',
      fechaDevolucion: new Date().toISOString(),
    });
  }
}