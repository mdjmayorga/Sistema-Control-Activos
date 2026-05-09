export interface Devolucion {
  id: string;
  prestamoId: string;
  danoConfirmado: boolean;
  fotoSubida?: boolean;
  nombreEstudiante: string;
  nombreActivo: string;
  numeroSerie: string;
  correoInstitucional: string;
  grupoTopografia: string;
  cuadrilla: string;
  razonPrestamo: string;
  fechaDevolucion: string;
  updatedAt: string;
}
