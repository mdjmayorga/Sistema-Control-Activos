import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';

import { routes } from './app.routes';
import { firebaseConfig } from './firebase.config';
import { environment } from '../environments/environment';

const devConfig = { ...firebaseConfig, projectId: 'demo-civco' };

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.useEmulators ? devConfig : firebaseConfig)),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (environment.useEmulators) connectFirestoreEmulator(firestore, 'localhost', 8080);
      return firestore;
    }),
    provideAuth(() => {
      const auth = getAuth();
      if (environment.useEmulators) connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      return auth;
    }),
  ]
};
