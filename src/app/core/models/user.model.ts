import { Timestamp } from '@angular/fire/firestore';

export interface UserProfile {
  fullName: string;
  studentId: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Timestamp;
}
