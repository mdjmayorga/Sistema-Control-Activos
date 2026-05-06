import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
  orderBy,
  QueryConstraint,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Loan } from '../../../core/models/loan.model';

export type LoanStatus = 'activo' | 'devuelto';

@Injectable({
  providedIn: 'root',
})
export class LoanHistoryService {
  private readonly firestore = inject(Firestore);

  getLoansByUser(
    userId: string,
    status?: LoanStatus
  ): Observable<Loan[]> {
    const loansRef = collection(this.firestore, 'prestamos');
    const constraints: QueryConstraint[] = [
      where('usuarioId', '==', userId),
    ];

    if (status) {
      constraints.push(where('estado', '==', status));
    }

    constraints.push(orderBy('fechaPrestamo', 'desc'));

    const loansQuery = query(loansRef, ...constraints);
    return collectionData(loansQuery, {
      idField: 'id',
    }) as Observable<Loan[]>;
  }

  getAllLoans(status?: LoanStatus): Observable<Loan[]> {
    const loansRef = collection(this.firestore, 'prestamos');
    const constraints: QueryConstraint[] = [];

    if (status) {
      constraints.push(where('estado', '==', status));
    }

    constraints.push(orderBy('fechaPrestamo', 'desc'));

    const loansQuery = query(loansRef, ...constraints);
    return collectionData(loansQuery, {
      idField: 'id',
    }) as Observable<Loan[]>;
  }
}
