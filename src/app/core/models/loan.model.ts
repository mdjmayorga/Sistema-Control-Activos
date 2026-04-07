export interface Loan {
  id?: string;
  grupoTopografia: string;
  cuadrilla: string;
  razonPrestamo: string;
  activo: string;
  numeroSerie?: string;
  estado: 'activo' | 'devuelto';
  fechaPrestamo: string;
  usuarioId: string;
  usuarioNombre: string;
}