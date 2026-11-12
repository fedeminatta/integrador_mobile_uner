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
import {
	listarFeriados,
	listarLineasRed,
	todasLasParadas,
	todosLosHorariosDeLinea,
} from '@/servicios/red';

let sincronizando = false;

/**
 * Baja el catálogo completo (líneas, paradas, recorridos, horarios y feriados) y lo guarda
 * en SQLite, para que la app abra y muestre algo aunque no haya conexión.
 * Se llama al iniciar la app y cada vez que vuelve la conexión (ver hooks/useRed.ts).
 */
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

		// Los recorridos van después de las paradas: recorrido_paradas tiene FK a paradas.
		await guardarRecorridos(rLineas.datos);

		for (const linea of rLineas.datos) {
			const rHorarios = await todosLosHorariosDeLinea(linea.id);
			if (!('error' in rHorarios))
				await guardarHorariosDeLinea(linea.id, rHorarios.datos);
			// Si falla una línea puntual, seguimos con las demás: mejor catálogo parcial que nada.
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

/** Reintenta enviar los reportes que quedaron pendientes por falta de conexión. */
export async function sincronizarReportesPendientes(): Promise<void> {
	const token = await leerToken();
	if (!token) return; // sin sesión no se puede reenviar

	const pendientes = await listarReportesPendientes();
	for (const r of pendientes) {
		try {
			await pedir('/reportes-demora', {
				metodo: 'POST',
				token,
				cuerpo: {
					lineaId: r.lineaId,
					paradaId: r.paradaId,
					motivo: r.motivo,
					comentario: r.comentario,
					fotoUri: r.fotoUri,
					fechaHora: r.fechaHora,
				},
			});
			await eliminarReportePendiente(r.id);
		} catch (e) {
			if (e instanceof ErrorDeApi) {
				await registrarErrorEnvio(r.id, e.message);
				// Seguimos sin señal: no tiene sentido insistir con el resto ahora.
				if (e.codigo === 'SIN_CONEXION') break;
			}
			// Si no es un ErrorDeApi (algo inesperado), se deja para el próximo intento.
		}
	}
}
