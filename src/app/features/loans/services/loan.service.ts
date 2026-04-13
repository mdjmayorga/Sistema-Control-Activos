import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  getDoc,
  query,
  setDoc,
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

  async marcarPrestamoComoDevuelto(prestamoId: string, productoDanado: boolean): Promise<void> {
    const prestamoRef = doc(this.firestore, 'prestamos', prestamoId);
    const prestamoSnapshot = await getDoc(prestamoRef);

    if (!prestamoSnapshot.exists()) {
      throw new Error('No se encontró el préstamo que se intenta devolver.');
    }

    const prestamoData = prestamoSnapshot.data() as Loan;
    const fechaDevolucion = new Date().toISOString();
    const devolucionRef = doc(this.firestore, 'devoluciones', prestamoId);

    await setDoc(
      devolucionRef,
      {
        prestamoId,
        danoConfirmado: productoDanado === true,
        nombreEstudiante: prestamoData.usuarioNombre ?? 'Estudiante Desconocido',
        nombreActivo: prestamoData.activo ?? 'Activo Desconocido',
        fechaDevolucion,
        updatedAt: fechaDevolucion,
      },
      { merge: true }
    );

    await updateDoc(prestamoRef, {
      estado: 'devuelto',
      fechaDevolucion,
    });
  }
}