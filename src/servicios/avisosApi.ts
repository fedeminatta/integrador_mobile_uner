import { ErrorDeApi, pedir } from '@/servicios/api';
import type { RespuestaError, RespuestaUno } from '@/tipos/api';
import type { Aviso, Linea } from '@/tipos/types';
import { listarAvisosRed, listarLineasRed } from '@/servicios/red';


export type Resultado<T> = RespuestaUno<T> | RespuestaError;

type OpcionesPedido = NonNullable<Parameters<typeof pedir>[1]>;

/** pedir() lanza ErrorDeApi en vez de devolver { error }*/
async function pedirSobre<T>(ruta: string, opciones: OpcionesPedido = {}): Promise<Resultado<T>> {
  try {
    const r = await pedir<T>(ruta, opciones);
    return { datos: r.datos, meta: null };
  } catch (e) {
    if (e instanceof ErrorDeApi) {
      return { error: { codigo: e.codigo, mensaje: e.message } };
    }
    return {
      error: { codigo: 'ERROR_DESCONOCIDO', mensaje: 'Algo salió mal. Probá de nuevo en un rato.' },
    };
  }
}

/** Aviso del contrato, numeros de línea para la tarjeta. */
export type AvisoVista = Aviso & { numerosLinea: string[] };

/** GET /avisos?porPagina=100 avisos vigentes (2 hoy). */
export function listarAvisosReales(): Promise<Resultado<Aviso[]>> {
  return pedirSobre<Aviso[]>('/avisos?porPagina=100');
}

/** Avisos  numeros de linea (lin-05 → "5"). Sin EXPO_PUBLIC_API_URL usa los datos de prueba. */
export async function avisosVistas(): Promise<Resultado<AvisoVista[]>> {
  const [rAvisos, rLineas] = await Promise.all([listarAvisosRed(), listarLineasRed()]);
  if ('error' in rAvisos) return rAvisos;
  const numeros =
    'error' in rLineas
      ? new Map<string, string>()
      : new Map(rLineas.datos.map((l: Linea) => [l.id, l.numero]));
  return {
    datos: rAvisos.datos.map((a) => ({
      ...a,
      numerosLinea: a.lineaIds
        .map((id) => numeros.get(id))
        .filter((n): n is string => n !== undefined),
    })),
    meta: null,
  };
}