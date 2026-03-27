import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where } from '@angular/fire/firestore';
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
}