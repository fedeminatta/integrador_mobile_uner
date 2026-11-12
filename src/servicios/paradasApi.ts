// src/servicios/paradasApi.ts
import { obtenerParadas } from '@/db/repositorios/paradas';
import { ErrorDeApi, pedirTodas } from '@/servicios/api';
import type { RespuestaError, RespuestaUno } from '@/tipos/api';
import type { Linea, Parada } from '@/tipos/types';

export type Resultado<T> = RespuestaUno<T> | RespuestaError;

type OpcionesPedido = NonNullable<Parameters<typeof pedirTodas>[1]>;

async function pedirSobre<T>(
	ruta: string,
	opciones: OpcionesPedido = {},
): Promise<Resultado<T[]>> {
	try {
		const r = await pedirTodas<T>(ruta, opciones);
		return { datos: r.datos, meta: null };
	} catch (e) {
		if (e instanceof ErrorDeApi)
			return { error: { codigo: e.codigo, mensaje: e.message } };
		return {
			error: {
				codigo: 'ERROR_DESCONOCIDO',
				mensaje: 'Algo salió mal. Probá de nuevo en un rato.',
			},
		};
	}
}

// QR en vivo: si no hay red no tiene sentido intentar desde la BD.
export async function paradaPorQr(
	codigo: string,
): Promise<RespuestaUno<Parada> | RespuestaError> {
	try {
		const { pedir } = await import('@/servicios/api');
		const r = await pedir<Parada>(`/paradas/qr/${encodeURIComponent(codigo)}`);
		return { datos: r.datos, meta: null };
	} catch (e) {
		if (e instanceof ErrorDeApi)
			return { error: { codigo: e.codigo, mensaje: e.message } };
		return {
			error: {
				codigo: 'ERROR_DESCONOCIDO',
				mensaje: 'Algo salió mal. Probá de nuevo en un rato.',
			},
		};
	}
}

// Baja todas las paradas (paginando) con fallback a SQLite si no hay red.
export async function listarParadasReales(): Promise<Resultado<Parada[]>> {
	const r = await pedirSobre<Parada>('/paradas', { porPagina: 1000 });
	if ('error' in r) {
		const locales = await obtenerParadas();
		if (locales.length > 0) return { datos: locales, meta: null };
	}
	return r;
}

export async function listarLineasReales(): Promise<Resultado<Linea[]>> {
	return pedirSobre<Linea>('/lineas', { porPagina: 100 });
}

/** Parada del contrato + datos de vista */
export type ParadaVista = Parada & {
	numerosLinea: string[];
	distancia?: number | null;
};
