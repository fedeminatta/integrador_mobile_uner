import { guardarPreferencia } from '@/db/preferencias';
import { avisosRedMock, feriadosRedMock, horariosRedMock, lineasRedMock, paradasRedMock } from '@/mocks/red';
import { ErrorDeApi, pedir, pedirTodas } from '@/servicios/api';
import { API_URL } from '@/servicios/config';
import { fallar, responder } from '@/servicios/simulador';
import { Respuesta } from '@/tipos';
import type { Aviso, Horario, Linea, Parada, TipoDeDia } from '@/tipos/types';
import { proximosPorLinea } from '@/utils/tablas';

// Líneas, paradas, horarios y avisos con los tipos del PRD.
// Sin EXPO_PUBLIC_API_URL se usan los datos de prueba de src/mocks/red.ts.
export const usaDatosDePrueba = !API_URL;

// Hora de la última respuesta buena de la API: sirve para avisar "datos de hace X" sin conexión.
export const CLAVE_ULTIMA_ACTUALIZACION = 'paran.ultimaActualizacion';

// Convierte lo que devuelve pedir() (que lanza ErrorDeApi) al formato { datos, meta } | { error }.
export async function desdeApi<T>(pedido: () => Promise<{ datos: T; fechaServidor: string | null }>): Promise<Respuesta<T>> {
  try {
    const { datos, fechaServidor } = await pedido();
    const generadoEn = fechaServidor ? new Date(fechaServidor).toISOString() : new Date().toISOString();
    guardarPreferencia(CLAVE_ULTIMA_ACTUALIZACION, generadoEn);
    return { datos, meta: { generadoEn, total: Array.isArray(datos) ? datos.length : null } };
  } catch (e) {
    if (e instanceof ErrorDeApi) return { error: { codigo: e.codigo, mensaje: e.message } };
    return { error: { codigo: 'ERROR_DESCONOCIDO', mensaje: 'Algo salió mal. Prueba de nuevo en un rato.' } };
  }
}

const noEncontrada = (codigo: string, mensaje: string) => fallar<never>({ codigo, mensaje });

export function listarLineasRed(): Promise<Respuesta<Linea[]>> {
  if (usaDatosDePrueba) return responder(lineasRedMock);
  return desdeApi(() => pedirTodas<Linea>('/lineas'));
}

export function obtenerLinea(id: string): Promise<Respuesta<Linea>> {
  if (usaDatosDePrueba) {
    const linea = lineasRedMock.find((l) => l.id === id);
    return linea ? responder(linea) : noEncontrada('LINEA_NO_ENCONTRADA', 'No existe esa línea.');
  }
  return desdeApi(() => pedir<Linea>(`/lineas/${encodeURIComponent(id)}`));
}

export function obtenerParada(id: string): Promise<Respuesta<Parada>> {
  if (usaDatosDePrueba) {
    const parada = paradasRedMock.find((p) => p.id === id);
    return parada ? responder(parada) : noEncontrada('PARADA_NO_ENCONTRADA', 'No existe esa parada.');
  }
  return desdeApi(() => pedir<Parada>(`/paradas/${encodeURIComponent(id)}`));
}

// Paradas de una línea (de los dos sentidos). El orden de paso lo da el recorrido.
export function paradasDeLinea(lineaId: string): Promise<Respuesta<Parada[]>> {
  if (usaDatosDePrueba) return responder(paradasRedMock.filter((p) => p.lineaIds.includes(lineaId)));
  return desdeApi(() => pedirTodas<Parada>(`/paradas?lineaId=${encodeURIComponent(lineaId)}`, { porPagina: 1000 }));
}

// Búsqueda por nombre o calle, sin importar tildes ni mayúsculas.
export function buscarParadas(texto: string): Promise<Respuesta<Parada[]>> {
  const q = texto.trim();
  if (usaDatosDePrueba) {
    const normal = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    return responder(paradasRedMock.filter((p) => normal(p.nombre).includes(normal(q))));
  }
  return desdeApi(() => pedirTodas<Parada>(`/paradas?orden=nombre${q ? `&q=${encodeURIComponent(q)}` : ''}`, { porPagina: 1000 }));
}

export async function listarFeriados(): Promise<Respuesta<string[]>> {
  if (usaDatosDePrueba) return responder(feriadosRedMock);
  const anio = new Date().getFullYear();
  const r = await desdeApi(async () => {
    const [este, siguiente] = await Promise.all([
      pedir<{ fecha: string }[]>(`/feriados?anio=${anio}`),
      pedir<{ fecha: string }[]>(`/feriados?anio=${anio + 1}`),
    ]);
    return { datos: [...este.datos, ...siguiente.datos].map((f) => f.fecha), fechaServidor: este.fechaServidor };
  });
  return r;
}

// Próximos pasos de cada línea por la parada, según la tabla (no hay GPS en los colectivos).
export function proximosEnParadaRed(paradaId: string, cantidad = 3): Promise<Respuesta<Horario[]>> {
  if (usaDatosDePrueba) {
    return responder(proximosPorLinea(horariosRedMock.filter((h) => h.paradaId === paradaId), new Date(), feriadosRedMock, cantidad));
  }
  return desdeApi(() => pedir<Horario[]>(`/paradas/${encodeURIComponent(paradaId)}/proximos?cantidad=${cantidad}`));
}

export function horariosDeParada(lineaId: string, paradaId: string, tipo: TipoDeDia): Promise<Respuesta<Horario[]>> {
  if (usaDatosDePrueba) {
    return responder(horariosRedMock.filter((h) => h.lineaId === lineaId && h.paradaId === paradaId && h.tipoDeDia === tipo));
  }
  const ruta = `/horarios?lineaId=${encodeURIComponent(lineaId)}&paradaId=${encodeURIComponent(paradaId)}&tipoDeDia=${tipo}`;
  return desdeApi(() => pedirTodas<Horario>(ruta, { porPagina: 5000 }));
}

export function listarAvisosRed(lineaId?: string): Promise<Respuesta<Aviso[]>> {
  if (usaDatosDePrueba) return responder(avisosRedMock.filter((a) => !lineaId || a.lineaIds.includes(lineaId)));
  return desdeApi(() => pedirTodas<Aviso>(`/avisos${lineaId ? `?lineaId=${encodeURIComponent(lineaId)}` : ''}`));
}

export function obtenerAviso(id: string): Promise<Respuesta<Aviso>> {
  if (usaDatosDePrueba) {
    const aviso = avisosRedMock.find((a) => a.id === id);
    return aviso ? responder(aviso) : noEncontrada('AVISO_NO_ENCONTRADO', 'No existe ese aviso.');
  }
  return desdeApi(() => pedir<Aviso>(`/avisos/${encodeURIComponent(id)}`));
}
