import type { Aviso, Coordenadas, Horario, Linea, Parada, ReporteDeDemora, Sentido, TipoDeDia } from '@/tipos/types';
import { isoParana } from '@/utils/tablas';

// Datos de prueba con los tipos del PRD, con los mismos ids que la API de la cátedra.
// Se usan cuando no hay EXPO_PUBLIC_API_URL configurada.

const punto = (latitud: number, longitud: number): Coordenadas => ({ latitud, longitud });

export const paradasRedMock: Parada[] = [
  // Línea 5, ida (hacia Puerto Viejo)
  { id: 'par-101', nombre: 'Alameda y Urquiza', coordenadas: punto(-31.7333, -60.5241), lineaIds: ['lin-05', 'lin-14'], sentido: 'ida', refugio: true, codigoQr: 'PARANA:par-101' },
  { id: 'par-102', nombre: 'Plaza 1° de Mayo', coordenadas: punto(-31.7321, -60.5286), lineaIds: ['lin-05'], sentido: 'ida', refugio: true, codigoQr: 'PARANA:par-102' },
  { id: 'par-103', nombre: 'Corrientes y Laprida', coordenadas: punto(-31.7298, -60.5322), lineaIds: ['lin-05', 'lin-07'], sentido: 'ida', refugio: false, codigoQr: 'PARANA:par-103' },
  { id: 'par-104', nombre: 'Puerto Viejo', coordenadas: punto(-31.7254, -60.5368), lineaIds: ['lin-05'], sentido: 'ida', refugio: true, codigoQr: null },
  // Línea 5, vuelta (hacia San Agustín): paradas del otro lado de la calle
  { id: 'par-111', nombre: 'Puerto Viejo (vuelta)', coordenadas: punto(-31.7257, -60.5364), lineaIds: ['lin-05'], sentido: 'vuelta', refugio: true, codigoQr: 'PARANA:par-111' },
  { id: 'par-112', nombre: 'San Martín y Gualeguaychú', coordenadas: punto(-31.7305, -60.5301), lineaIds: ['lin-05'], sentido: 'vuelta', refugio: true, codigoQr: 'PARANA:par-112' },
  { id: 'par-113', nombre: 'Almafuerte y Newbery', coordenadas: punto(-31.7402, -60.5155), lineaIds: ['lin-05', 'lin-14'], sentido: 'vuelta', refugio: false, codigoQr: 'PARANA:par-113' },
  { id: 'par-114', nombre: 'San Agustín', coordenadas: punto(-31.7461, -60.5089), lineaIds: ['lin-05'], sentido: 'vuelta', refugio: true, codigoQr: 'PARANA:par-114' },
  // Línea 14 y 7
  { id: 'par-120', nombre: 'Bajada Grande', coordenadas: punto(-31.7189, -60.5482), lineaIds: ['lin-14'], sentido: 'ida', refugio: true, codigoQr: 'PARANA:par-120' },
  { id: 'par-130', nombre: 'Terminal de Ómnibus', coordenadas: punto(-31.7385, -60.5196), lineaIds: ['lin-07'], sentido: 'ida', refugio: true, codigoQr: 'PARANA:par-130' },
];

const trazadoDe = (ids: string[]) => ids.map((id) => paradasRedMock.find((p) => p.id === id)!.coordenadas);

const recorrido = (sentido: Sentido, destino: string, paradaIds: string[]) => ({
  sentido,
  destino,
  paradaIds,
  trazado: trazadoDe(paradaIds),
});

export const lineasRedMock: Linea[] = [
  {
    id: 'lin-05',
    numero: '5',
    nombre: 'Puerto Viejo — San Agustín',
    color: '#1B6CA8',
    empresa: 'Transporte Mariano Moreno',
    activa: true,
    recorridos: [
      recorrido('ida', 'hacia Puerto Viejo', ['par-101', 'par-102', 'par-103', 'par-104']),
      recorrido('vuelta', 'hacia San Agustín', ['par-111', 'par-112', 'par-113', 'par-114']),
    ],
  },
  {
    id: 'lin-07',
    numero: '7',
    nombre: 'Terminal — Puerto',
    color: '#C0392B',
    empresa: 'Ersa Urbano',
    activa: true,
    recorridos: [recorrido('ida', 'hacia el Puerto', ['par-130', 'par-103'])],
  },
  {
    id: 'lin-14',
    numero: '14',
    nombre: 'Bajada Grande — Almafuerte',
    color: '#2E8B57',
    empresa: 'Transporte Mariano Moreno',
    activa: true,
    recorridos: [
      recorrido('ida', 'hacia Bajada Grande', ['par-101', 'par-120']),
      recorrido('vuelta', 'hacia Almafuerte', ['par-113']),
    ],
  },
];

// Frecuencia en minutos por tipo de día. La 14 termina a las 21:00 para probar el fin de servicio.
const frecuencias: Record<TipoDeDia, number> = { habil: 20, sabado: 30, domingo: 40, feriado: 40 };
const ultimoServicio: Record<string, number> = { 'lin-05': 23 * 60, 'lin-07': 22 * 60, 'lin-14': 21 * 60 };
const PRIMER_SERVICIO = 5 * 60 + 20;
const MINUTOS_ENTRE_PARADAS = 4;

const comoHora = (minutos: number) =>
  `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;

function generarHorarios(): Horario[] {
  const horarios: Horario[] = [];
  for (const linea of lineasRedMock) {
    for (const r of linea.recorridos) {
      for (const [tipoDeDia, frecuencia] of Object.entries(frecuencias) as [TipoDeDia, number][]) {
        r.paradaIds.forEach((paradaId, orden) => {
          for (let salida = PRIMER_SERVICIO; salida <= ultimoServicio[linea.id]; salida += frecuencia) {
            const hora = comoHora(salida + orden * MINUTOS_ENTRE_PARADAS);
            horarios.push({ id: `hor-${linea.id}-${paradaId}-${tipoDeDia}-${hora}`, lineaId: linea.id, paradaId, sentido: r.sentido, tipoDeDia, hora });
          }
        });
      }
    }
  }
  return horarios;
}

export const horariosRedMock: Horario[] = generarHorarios();

// Las fechas de avisos y reportes son relativas a "ahora", como en la API.
const haceMinutos = (minutos: number) => isoParana(new Date(Date.now() - minutos * 60_000));
const enDias = (dias: number) => isoParana(new Date(Date.now() + dias * 86_400_000));

export const avisosRedMock: Aviso[] = [
  {
    id: 'avi-088',
    titulo: 'Desvío por obra en Corrientes',
    detalle: 'Por la obra cloacal en calle Corrientes, la línea 7 circula por Santa Fe entre Laprida y Urquiza. La parada de Corrientes y Laprida queda sin servicio.',
    lineaIds: ['lin-07'],
    desde: haceMinutos(3 * 24 * 60),
    hasta: enDias(10),
    gravedad: 'desvio',
    trazadoAlternativo: [punto(-31.7385, -60.5196), punto(-31.7341, -60.5262), punto(-31.7298, -60.5322)],
    videoUrl: 'https://example.com/desvio-corrientes.mp4',
  },
  {
    id: 'avi-089',
    titulo: 'Nuevo refugio en Alameda y Urquiza',
    detalle: 'La parada de Alameda y Urquiza ya tiene refugio y código QR.',
    lineaIds: ['lin-05', 'lin-14'],
    desde: haceMinutos(24 * 60),
    hasta: null,
    gravedad: 'informativo',
    trazadoAlternativo: null,
    videoUrl: null,
  },
];

export const reportesRedMock: ReporteDeDemora[] = [
  {
    id: 'rep-3390',
    lineaId: 'lin-05',
    paradaId: 'par-101',
    usuarioId: 'usr-321',
    motivo: 'no_paso',
    comentario: 'El de las 10:42 no pasó.',
    fotoUri: null,
    confirmaciones: 2,
    fechaHora: haceMinutos(15),
    sincronizado: true,
  },
];

export const feriadosRedMock: string[] = ['2026-11-23', '2026-12-08', '2026-12-25', '2027-01-01'];
