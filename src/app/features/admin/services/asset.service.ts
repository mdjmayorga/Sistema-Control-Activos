import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Asset } from '../../../core/models/asset.model';

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  private readonly firestore = inject(Firestore);
  private readonly collectionName = 'activos';

  obtenerActivos(): Observable<Asset[]> {
    const ref = collection(this.firestore, this.collectionName);
    const q = query(ref, orderBy('nombre'));
    return collectionData(q, { idField: 'id' }) as Observable<Asset[]>;
  }

  async agregarActivo(asset: Omit<Asset, 'id'>): Promise<void> {
    const ref = collection(this.firestore, this.collectionName);
    await addDoc(ref, asset);
  }

  async eliminarActivo(id: string): Promise<void> {
    const ref = doc(this.firestore, this.collectionName, id);
    await deleteDoc(ref);
  }
}
