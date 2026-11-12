import { obtenerDb } from '@/db';
import { upsertUsuarioLocal } from '@/db/repositorios/usuario';
import type { MotivoDemora, ReporteDeDemora, Usuario } from '@/tipos/types';

type FilaReporte = {
	id: string;
	lineaId: string;
	paradaId: string;
	usuarioId: string;
	motivoId: string;
	comentario: string | null;
	fotoUri: string | null;
	fechaHora: string;
	sincronizado: number;
	intentos: number;
	ultimoError: string | null;
};

function aReporte(f: FilaReporte): ReporteDeDemora {
	return {
		id: f.id,
		lineaId: f.lineaId,
		paradaId: f.paradaId,
		usuarioId: f.usuarioId,
		motivo: f.motivoId as MotivoDemora,
		comentario: f.comentario,
		fotoUri: f.fotoUri,
		confirmaciones: 0,
		fechaHora: f.fechaHora,
		sincronizado: f.sincronizado === 1,
	};
}

type DatosReporte = {
	lineaId: string;
	paradaId: string;
	motivo: MotivoDemora;
	comentario: string | null;
	fotoUri?: string | null;
};

// Guarda el reporte en el teléfono para mandarlo cuando vuelva la señal.
export async function encolarReporte(
	datos: DatosReporte,
	usuario: Usuario,
): Promise<ReporteDeDemora> {
	const db = await obtenerDb();
	await upsertUsuarioLocal(usuario); // satisface la FK reportes.usuarioId -> usuario.id

	const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	const fechaHora = new Date().toISOString();

	await db.runAsync(
		`INSERT INTO reportes (id, lineaId, paradaId, usuarioId, motivoId, comentario, fotoUri, fechaHora, sincronizado, intentos, ultimoError)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NULL)`,
		[
			id,
			datos.lineaId,
			datos.paradaId,
			usuario.id,
			datos.motivo,
			datos.comentario,
			datos.fotoUri ?? null,
			fechaHora,
		],
	);

	return {
		id,
		lineaId: datos.lineaId,
		paradaId: datos.paradaId,
		usuarioId: usuario.id,
		motivo: datos.motivo,
		comentario: datos.comentario,
		fotoUri: datos.fotoUri ?? null,
		confirmaciones: 0,
		fechaHora,
		sincronizado: false,
	};
}

export async function listarReportesPendientes(): Promise<ReporteDeDemora[]> {
	const db = await obtenerDb();
	const filas = await db.getAllAsync<FilaReporte>(
		`SELECT * FROM reportes WHERE sincronizado = 0 ORDER BY fechaHora ASC`,
	);
	return filas.map(aReporte);
}

export async function eliminarReportePendiente(id: string): Promise<void> {
	const db = await obtenerDb();
	await db.runAsync(`DELETE FROM reportes WHERE id = ?`, [id]);
}

export async function registrarErrorEnvio(
	id: string,
	mensaje: string,
): Promise<void> {
	const db = await obtenerDb();
	await db.runAsync(
		`UPDATE reportes SET intentos = intentos + 1, ultimoError = ? WHERE id = ?`,
		[mensaje, id],
	);
}
