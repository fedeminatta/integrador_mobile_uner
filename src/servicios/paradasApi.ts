import { ErrorDeApi, pedir } from '@/servicios/api';
import type { RespuestaError, RespuestaUno } from '@/tipos/api';
import type { Parada } from '@/tipos/types';


export type Resultado<T> = RespuestaUno<T> | RespuestaError;

type OpcionesPedido = NonNullable<Parameters<typeof pedir>[1]>;


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


export function paradaPorQr(codigo: string): Promise<Resultado<Parada>> {
  return pedirSobre<Parada>(`/paradas/qr/${encodeURIComponent(codigo)}`);
}