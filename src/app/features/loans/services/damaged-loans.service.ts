import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { Storage, ref, getDownloadURL } from '@angular/fire/storage';
import { Observable, from, of, switchMap, forkJoin, map, catchError } from 'rxjs';
import { DamagedLoanCardData } from '../components/damaged-loan-card/damaged-loan-card';
import { Devolucion } from '../../../core/models/devolucion.model';

@Injectable({ providedIn: 'root' })
export class DamagedLoansService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);

  obtenerPrestamosDanados(): Observable<DamagedLoanCardData[]> {
    const col = collection(this.firestore, 'devoluciones');
    const q = query(col, where('danoConfirmado', '==', true));

    return (collectionData(q, { idField: 'id' }) as Observable<Devolucion[]>).pipe(
      switchMap(docs => {
        if (docs.length === 0) return of([]);

        const cards$ = docs.map(doc => {
          if (!doc.fotoSubida) {
            return of(this.toCard(doc, undefined));
          }
          const storageRef = ref(this.storage, `damages/${doc.id}/evidence.jpg`);
          return from(getDownloadURL(storageRef)).pipe(
            map(url => this.toCard(doc, url)),
            catchError(() => of(this.toCard(doc, undefined)))
          );
        });

        return forkJoin(cards$);
      })
    );
  }

  private toCard(doc: Devolucion, imagenUrl: string | undefined): DamagedLoanCardData {
    return {
      id: doc.id,
      activo: doc.nombreActivo,
      usuarioNombre: doc.nombreEstudiante,
      fechaReporte: doc.fechaDevolucion,
      descripcionDanio: doc.razonPrestamo,
      severidad: 'moderado',
      imagenUrl,
    };
  }
}
