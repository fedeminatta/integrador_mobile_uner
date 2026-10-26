import { API_URL, TIMEOUT_MS } from './config';

// Forma del sobre de la API (ver README y contract/api.ts).
export type MetaLista = { total: number; pagina: number; porPagina: number };

export type RespuestaApi<T> = {
	datos: T;
	meta: MetaLista | null;
	/** Hora del servidor (cabecera Date). Sirve para "información de hace X". */
	fechaServidor: string | null;
};

/** Error que lanzan todas las funciones de este archivo. */
export class ErrorDeApi extends Error {
	codigo: string;
	estado: number | null;

	constructor(codigo: string, mensaje: string, estado: number | null = null) {
		super(mensaje);
		this.name = 'ErrorDeApi';
		this.codigo = codigo;
		this.estado = estado;
	}
}

type Opciones = {
	metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	cuerpo?: unknown;
	/** Token de sesión (viene de expo-secure-store). */
	token?: string | null;
	/** Cabeceras extra, por ejemplo X-Simular para probar errores. */
	cabeceras?: Record<string, string>;
};

export async function pedir<T>(
	ruta: string,
	opciones: Opciones = {},
): Promise<RespuestaApi<T>> {
	const { metodo = 'GET', cuerpo, token, cabeceras } = opciones;

	const controlador = new AbortController();
	const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_MS);

	let respuesta: Response;
	try {
		respuesta = await fetch(`${API_URL}${ruta}`, {
			method: metodo,
			signal: controlador.signal,
			headers: {
				Accept: 'application/json',
				...(cuerpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
				...(token ? { Authorization: `Bearer ${token}` } : {}),
				...cabeceras,
			},
			body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
		});
	} catch {
		// Sin red, API apagada, firewall o tiempo agotado.
		throw new ErrorDeApi(
			'SIN_CONEXION',
			'No pudimos conectar. Revisá tu conexión e intentá de nuevo.',
		);
	} finally {
		clearTimeout(temporizador);
	}

	let json: any = null;
	try {
		json = await respuesta.json();
	} catch {
		// Respuesta que no es JSON (por ejemplo, un 204 sin cuerpo).
	}

	if (!respuesta.ok || (json && json.error)) {
		const e = json?.error;
		throw new ErrorDeApi(
			e?.codigo ?? 'ERROR_DESCONOCIDO',
			e?.mensaje ?? 'Algo salió mal. Probá de nuevo en un rato.',
			respuesta.status,
		);
	}

	return {
		datos: (json?.datos ?? null) as T,
		meta: json?.meta ?? null,
		fechaServidor: respuesta.headers.get('Date'),
	};
}

/**
 * Pide todas las páginas de una lista y las junta.
 * `porPagina` máximo: confirmar en http://<tu-api>/docs (el README usa 5000 en /horarios).
 */
export async function pedirTodas<T>(
	ruta: string,
	opciones: Opciones & { porPagina?: number } = {},
): Promise<{ datos: T[]; fechaServidor: string | null }> {
	const { porPagina = 500, ...resto } = opciones;
	const separador = ruta.includes('?') ? '&' : '?';

	const acumulado: T[] = [];
	let pagina = 1;
	let fechaServidor: string | null = null;

	while (true) {
		const r = await pedir<T[]>(
			`${ruta}${separador}pagina=${pagina}&porPagina=${porPagina}`,
			resto,
		);
		acumulado.push(...r.datos);
		fechaServidor = r.fechaServidor;

		const total = r.meta?.total ?? acumulado.length;
		if (acumulado.length >= total || r.datos.length === 0) break;
		pagina += 1;
	}

	return { datos: acumulado, fechaServidor };
}
