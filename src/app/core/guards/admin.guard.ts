import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { AuthService } from '../services/auth.service';

/**
 * AU004 - Guard de administrador.
 * Redirige a /login si no hay sesión, o a /unauthorized si el usuario
 * está autenticado pero no tiene rol 'admin'.
 */
export const adminGuard: CanActivateFn = (): Promise<boolean | UrlTree> => {
  const auth = inject(Auth);
  const authService = inject(AuthService);
  const router = inject(Router);

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribe();

      if (!firebaseUser) {
        resolve(router.createUrlTree(['/login']));
        return;
      }

      const role = await authService.getUserRole(firebaseUser.uid);
      resolve(role === 'admin' ? true : router.createUrlTree(['/unauthorized']));
    });
  });
};
