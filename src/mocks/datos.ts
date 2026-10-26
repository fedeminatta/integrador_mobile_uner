import { Aviso, Linea, Parada, ProximoHorario, Usuario } from '@/tipos';

export const lineasMock: Linea[] = [
  { id: 'l1', numero: '1', nombre: 'Línea 1', recorrido: 'Terminal → Parque Urquiza', estado: 'normal' },
  { id: 'l6', numero: '6', nombre: 'Línea 6', recorrido: 'Barrio Lomas del Mirador → Centro', estado: 'desvio' },
  { id: 'l9', numero: '9', nombre: 'Línea 9', recorrido: 'San Agustín → Hospital San Martín', estado: 'normal' },
  { id: 'l14', numero: '14', nombre: 'Línea 14', recorrido: 'Paracao → Plaza 1° de Mayo', estado: 'normal' },
  { id: 'l22', numero: '22', nombre: 'Línea 22', recorrido: 'Terminal → Hospital San Roque', estado: 'normal' },
];

export const paradasMock: Parada[] = [
  { id: 'p1', nombre: 'Urquiza y 25 de Mayo', referencia: 'Frente a Plaza 1° de Mayo', lineaIds: ['l1', 'l6', 'l22'] },
  { id: 'p2', nombre: 'Terminal de Ómnibus', referencia: 'Andén municipal', lineaIds: ['l1', 'l22'] },
  { id: 'p3', nombre: 'Av. Ramírez y Gualeguaychú', referencia: null, lineaIds: ['l6', 'l9', 'l14'] },
  { id: 'p4', nombre: 'Hospital San Martín', referencia: 'Entrada por calle Perú', lineaIds: ['l9'] },
];

export const proximosMock: ProximoHorario[] = [
  { id: 'h1', lineaId: 'l6', numeroLinea: '6', destino: 'Centro', paradaId: 'p1', nombreParada: 'Urquiza y 25 de Mayo', hora: '14:35' },
  { id: 'h2', lineaId: 'l22', numeroLinea: '22', destino: 'Hospital San Roque', paradaId: 'p1', nombreParada: 'Urquiza y 25 de Mayo', hora: '14:50' },
  { id: 'h3', lineaId: 'l1', numeroLinea: '1', destino: 'Parque Urquiza', paradaId: 'p1', nombreParada: 'Urquiza y 25 de Mayo', hora: '15:05' },
];

export const avisosMock: Aviso[] = [
  {
    id: 'a1',
    lineaId: 'l6',
    numeroLinea: '6',
    titulo: 'Desvío por obras en calle Urquiza',
    detalle: 'Entre Corrientes y Laprida la Línea 6 circula por calle Andrés Pazos. Las paradas de Urquiza quedan sin servicio.',
    desde: '2026-10-20T06:00:00-03:00',
    hasta: '2026-10-30T23:59:00-03:00',
  },
  {
    id: 'a2',
    lineaId: null,
    numeroLinea: null,
    titulo: 'Horario de domingo el feriado del 20/11',
    detalle: 'Todas las líneas funcionan con la tabla de domingos y feriados.',
    desde: '2026-11-20T00:00:00-03:00',
    hasta: '2026-11-20T23:59:00-03:00',
  },
];

// Usuario de prueba para el login simulado (no es una cuenta real).
export const usuariosMock: (Usuario & { contrasena: string })[] = [
  { id: 'u1', nombre: 'Usuario de prueba', correo: 'demo@paran.app', contrasena: 'paran123' },
];
