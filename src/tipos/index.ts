// Interfaces del PRD. IDs string, fechas ISO 8601 con zona, horarios "HH:MM", vacíos como null.

export type Meta = {
  generadoEn: string;
  total: number | null;
};

export type ErrorApi = {
  codigo: string;
  mensaje: string;
};

export type Respuesta<T> = { datos: T; meta: Meta } | { error: ErrorApi };

export type EstadoLinea = 'normal' | 'desvio';

export type Linea = {
  id: string;
  numero: string;
  nombre: string;
  recorrido: string;
  estado: EstadoLinea;
};

export type Parada = {
  id: string;
  nombre: string;
  referencia: string | null;
  lineaIds: string[];
};

export type ProximoHorario = {
  id: string;
  lineaId: string;
  numeroLinea: string;
  destino: string;
  paradaId: string;
  nombreParada: string;
  hora: string;
};

export type Aviso = {
  id: string;
  lineaId: string | null;
  numeroLinea: string | null;
  titulo: string;
  detalle: string;
  desde: string;
  hasta: string | null;
};

export type Usuario = {
  id: string;
  nombre: string;
  correo: string;
};

export type Sesion = {
  token: string;
  usuario: Usuario;
};
