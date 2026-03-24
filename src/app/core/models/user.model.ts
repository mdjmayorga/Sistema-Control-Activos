/**
 * AU004 - Modelo de roles de usuario.
 * Define los roles disponibles en el sistema y el perfil de usuario en Firestore.
 */

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  nombre: string;
  carnet: string;
  role: UserRole;
  createdAt: Date;
}
