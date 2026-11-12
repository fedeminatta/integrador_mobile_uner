import { leerToken } from '@/db/almacen-seguro';
import { encolarReporte } from '@/db/cola-reportes';
import { reportesRedMock } from '@/mocks/red';
import { ErrorDeApi, pedir } from '@/servicios/api';
import { desdeApi, usaDatosDePrueba } from '@/servicios/red';
import { fallar, responder } from '@/servicios/simulador';
import { Respuesta } from '@/tipos';
import type { MotivoDemora, ReporteDeDemora, Usuario } from '@/tipos/types';
import { isoParana } from '@/utils/tablas';

export const motivosDemora: { motivo: MotivoDemora; titulo: string }[] = [
	{ motivo: 'no_paso', titulo: 'No pasó' },
	{ motivo: 'paso_lleno', titulo: 'Pasó lleno y no paró' },
	{ motivo: 'demorado', titulo: 'Viene demorado' },
	{ motivo: 'unidad_rota', titulo: 'Unidad rota' },
	{ motivo: 'calle_cortada', titulo: 'Calle cortada' },
];

export function tituloMotivo(motivo: MotivoDemora): string {
	return motivosDemora.find((m) => m.motivo === motivo)?.titulo ?? motivo;
}

export type NuevoReporte = {
	lineaId: string;
	paradaId: string;
	motivo: MotivoDemora;
	comentario: string | null;
};

const sinSesion = () =>
	fallar<never>({
		codigo: 'NO_AUTENTICADO',
		mensaje: 'Para reportar o confirmar tienes que iniciar sesión.',
	});

// Usuario de los datos de prueba (ver usuariosMock).
const USUARIO_DE_PRUEBA = 'u1';
const VIGENCIA_MS = 90 * 60_000;

// Reportes de los últimos 90 minutos en la parada.
export function reportesDeParada(
	paradaId: string,
): Promise<Respuesta<ReporteDeDemora[]>> {
	if (usaDatosDePrueba) {
		const recientes = reportesRedMock.filter(
			(r) =>
				r.paradaId === paradaId &&
				Date.now() - new Date(r.fechaHora).getTime() < VIGENCIA_MS,
		);
		return responder(
			[...recientes].sort((a, b) => b.fechaHora.localeCompare(a.fechaHora)),
		);
	}
	return desdeApi(() =>
		pedir<ReporteDeDemora[]>(
			`/reportes-demora?paradaId=${encodeURIComponent(paradaId)}`,
		),
	);
}

/**
 * `usuario` hace falta para la cola offline (reportes.usuarioId tiene FK local a usuario.id).
 * Lo pasa la pantalla, que ya lo tiene de useSesion() y por eso deshabilita el botón sin sesión.
 */
export async function enviarReporte(
	nuevo: NuevoReporte,
	usuario: Usuario,
): Promise<Respuesta<ReporteDeDemora>> {
	const token = await leerToken();
	if (!token) return sinSesion();
	const fechaHora = isoParana(new Date());

	if (usaDatosDePrueba) {
		const reporte: ReporteDeDemora = {
			...nuevo,
			id: `rep-${Date.now()}`,
			usuarioId: USUARIO_DE_PRUEBA,
			fotoUri: null,
			confirmaciones: 0,
			fechaHora,
			sincronizado: true,
		};
		reportesRedMock.unshift(reporte);
		return responder(reporte);
	}

	try {
		const r = await pedir<ReporteDeDemora>('/reportes-demora', {
			metodo: 'POST',
			token,
			cuerpo: { ...nuevo, fotoUri: null, fechaHora },
		});
		return { datos: r.datos, meta: { generadoEn: fechaHora, total: null } };
	} catch (e) {
		if (e instanceof ErrorDeApi && e.codigo === 'SIN_CONEXION') {
			// Sin señal: se guarda en el teléfono y se reintenta solo cuando vuelva la conexión
			// (ver servicios/sincronizacion.ts, llamado desde hooks/useRed.ts).
			const pendiente = await encolarReporte(nuevo, usuario);
			return { datos: pendiente, meta: { generadoEn: fechaHora, total: null } };
		}
		if (e instanceof ErrorDeApi)
			return { error: { codigo: e.codigo, mensaje: e.message } };
		return {
			error: {
				codigo: 'ERROR_DESCONOCIDO',
				mensaje: 'Algo salió mal. Prueba de nuevo en un rato.',
			},
		};
	}
}

export async function confirmarReporte(
	id: string,
): Promise<Respuesta<ReporteDeDemora>> {
	const token = await leerToken();
	if (!token) return sinSesion();

	if (usaDatosDePrueba) {
		const reporte = reportesRedMock.find((r) => r.id === id);
		if (!reporte)
			return fallar({
				codigo: 'REPORTE_NO_ENCONTRADO',
				mensaje: 'No encontramos ese reporte.',
			});
		if (reporte.usuarioId === USUARIO_DE_PRUEBA)
			return fallar({
				codigo: 'CONFIRMACION_PROPIA',
				mensaje: 'No puedes confirmar tu propio reporte.',
			});
		reporte.confirmaciones += 1;
		return responder(reporte);
	}
	return desdeApi(() =>
		pedir<ReporteDeDemora>(
			`/reportes-demora/${encodeURIComponent(id)}/confirmaciones`,
			{ metodo: 'POST', token },
		),
	);
}
