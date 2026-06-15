import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Asset } from '../../../core/models/asset.model';

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  private readonly firestore = inject(Firestore);
  private readonly collectionName = 'activos';

  obtenerActivos(): Observable<Asset[]> {
    const ref = collection(this.firestore, this.collectionName);
    return (collectionData(ref, { idField: 'id' }) as Observable<Asset[]>).pipe(
      map((assets) => assets.sort((a, b) => a.nombre.localeCompare(b.nombre)))
    );
  }

  async agregarActivo(asset: Omit<Asset, 'id'>): Promise<void> {
    const ref = collection(this.firestore, this.collectionName);
    await addDoc(ref, asset);
  }
}
