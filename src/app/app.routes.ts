import { Routes } from '@angular/router';
import { PrestamosActivosAdminPage } from './features/prestamos/pages/prestamos-activos-admin-page/prestamos-activos-admin-page';
import { HistorialPage } from './features/admin/pages/historial-page/historial-page';
import { ConfiguracionesPage } from './features/admin/pages/configuraciones-page/configuraciones-page';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'prestamos-activos',
        pathMatch: 'full',
    },
    {
        path: 'prestamos-activos',
        component: PrestamosActivosAdminPage,
    },
    {
        path: 'mis-prestamos',
        component: PrestamosActivosAdminPage,
    },
    {
        path: 'prestamos-activos-admin-page',
        redirectTo: 'prestamos-activos',
        pathMatch: 'full',
    },
    {
        path: 'historial',
        component: HistorialPage,
    },
    {
        path: 'mi-historial',
        component: HistorialPage,
    },
    {
        path: 'configuraciones',
        component: ConfiguracionesPage,
    },
    {
        path: '**',
        redirectTo: 'prestamos-activos',
    },
];
