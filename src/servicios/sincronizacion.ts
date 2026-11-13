import { leerToken } from '@/db/almacen-seguro';
import {
	eliminarReportePendiente,
	listarReportesPendientes,
	registrarErrorEnvio,
} from '@/db/cola-reportes';
import { guardarFeriados } from '@/db/repositorios/feriados';
import { guardarHorariosDeLinea } from '@/db/repositorios/horarios';
import { guardarLineas, guardarRecorridos } from '@/db/repositorios/lineas';
import { guardarParadas } from '@/db/repositorios/paradas';
import { ErrorDeApi, pedir } from '@/servicios/api';
import { API_URL } from '@/servicios/config';
import {
	listarFeriados,
	listarLineasRed,
	todasLasParadas,
	todosLosHorariosDeLinea,
} from '@/servicios/red';

let sincronizando = false;

export async function sincronizarCatalogo(): Promise<{
	ok: boolean;
	motivo?: string;
}> {
	if (sincronizando) return { ok: true };
	sincronizando = true;
	try {
		const rLineas = await listarLineasRed();
		if ('error' in rLineas) return { ok: false, motivo: rLineas.error.mensaje };
		await guardarLineas(rLineas.datos);

		const rParadas = await todasLasParadas();
		if ('error' in rParadas)
			return { ok: false, motivo: rParadas.error.mensaje };
		await guardarParadas(rParadas.datos);

		await guardarRecorridos(rLineas.datos);

		for (const linea of rLineas.datos) {
			const rHorarios = await todosLosHorariosDeLinea(linea.id);
			if (!('error' in rHorarios))
				await guardarHorariosDeLinea(linea.id, rHorarios.datos);
		}

		const rFeriados = await listarFeriados();
		if (!('error' in rFeriados)) await guardarFeriados(rFeriados.datos);

		return { ok: true };
	} catch (e) {
		return {
			ok: false,
			motivo:
				e instanceof Error ? e.message : 'Error desconocido al sincronizar.',
		};
	} finally {
		sincronizando = false;
	}
}

/**
 * Sube una foto local al servidor y devuelve la URL remota.
 * El flujo del PRD pide subir primero la foto (POST /archivos) y después el reporte.
 */
 export async function subirFoto(uri: string, token: string): Promise<string> {
	const formulario = new FormData();
	// React Native acepta un objeto con uri, name y type donde va el archivo.
	formulario.append('archivo', {
		uri,
		name: 'foto.jpg',
		type: 'image/jpeg',
	} as any);

	const r = await fetch(`${API_URL}/archivos`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}` },
		body: formulario,
	});
	if (!r.ok) {
		const json = await r.json().catch(() => ({}));
		throw new ErrorDeApi(
			json?.error?.codigo ?? 'ERROR_SUBIDA',
			json?.error?.mensaje ?? 'No se pudo subir la foto.',
			r.status,
		);
	}
	const json = await r.json();
	return json.datos.url as string;
}

/** Reintenta enviar los reportes que quedaron pendientes por falta de conexión. */
export async function sincronizarReportesPendientes(): Promise<void> {
	const token = await leerToken();
	if (!token) return;

	const pendientes = await listarReportesPendientes();
	for (const r of pendientes) {
		try {
			// Si el reporte tiene foto local (file://), subirla primero y reemplazar la URI.
			let fotoUrl = r.fotoUri;
			if (fotoUrl?.startsWith('file://')) {
				fotoUrl = await subirFoto(fotoUrl, token);
			}

			await pedir('/reportes-demora', {
				metodo: 'POST',
				token,
				cuerpo: {
					lineaId: r.lineaId,
					paradaId: r.paradaId,
					motivo: r.motivo,
					comentario: r.comentario,
					fotoUri: fotoUrl,
					fechaHora: r.fechaHora,
				},
			});
			await eliminarReportePendiente(r.id);
		} catch (e) {
			if (e instanceof ErrorDeApi) {
				await registrarErrorEnvio(r.id, e.message);
				if (e.codigo === 'SIN_CONEXION') break;
				// Errores definitivos (ya enviado, validación): se descartan sin reintentar.
				if (
					[
						'REPORTE_YA_ENVIADO',
						'VALIDACION_FALLIDA',
						'LINEA_NO_PARA_EN_PARADA',
					].includes(e.codigo)
				) {
					await eliminarReportePendiente(r.id);
				}
			}
		}
	}
}
