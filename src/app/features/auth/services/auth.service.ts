import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  updateProfile,
  UserCredential,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { UserProfile } from '../../../core/models/user.model';

export interface RegisterPayload {
  fullName: string;
  studentId: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);

  /**
   * Registers a new user
   */
  async register(payload: RegisterPayload): Promise<UserCredential> {
    const { fullName, studentId, email, password } = payload;

    const credential = await createUserWithEmailAndPassword(this.auth, email, password);

    await updateProfile(credential.user, { displayName: fullName });

    const userProfile: UserProfile = {
      fullName,
      studentId,
      email,
      role: 'user',
      createdAt: serverTimestamp() as unknown as UserProfile['createdAt'],
    };

    const userDocRef = doc(this.firestore, 'users', credential.user.uid);
    await setDoc(userDocRef, userProfile);

    return credential;
  }
}
