import { Timestamp } from '@angular/fire/firestore';

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  fullName: string;
  studentId: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp;
}



