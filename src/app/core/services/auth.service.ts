import { inject, Injectable } from '@angular/core';
import {
  Auth,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  user,
} from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { UserProfile, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  /** AU004 - Observable del usuario de Firebase Authentication. */
  readonly currentUser$ = user(this.auth);

  /**
   * AU004 - Obtiene el rol del usuario desde Firestore.
   * @param uid UID del usuario en Firebase Auth.
   */
  async getUserRole(uid: string): Promise<UserRole | null> {
    const snap = await getDoc(doc(this.firestore, `users/${uid}`));
    if (!snap.exists()) return null;
    return (snap.data() as Partial<UserProfile>).role ?? null;
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  async getUserDisplayName(
    uid: string,
    displayName: string | null,
    email: string | null,
  ): Promise<string> {
    try {
      const profileSnap = await getDoc(doc(this.firestore, `users/${uid}`));
      if (profileSnap.exists()) {
        const data = profileSnap.data() as { fullName?: string; nombre?: string };
        const profileName = (data.fullName ?? data.nombre ?? '').trim();
        if (profileName) return profileName;
      }
    } catch {
    }

    if (displayName?.trim()) return displayName.trim();
    if (email?.trim()) return email.trim();
    return 'Usuario';
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }
}
