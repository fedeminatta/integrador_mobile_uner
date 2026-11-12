import { obtenerDb } from '@/db';
import type { Horario, TipoDeDia } from '@/tipos/types';

// Se borran y recrean enteros por línea: es más simple que diffear miles de filas.
export async function guardarHorariosDeLinea(
	lineaId: string,
	horarios: Horario[],
): Promise<void> {
	const db = await obtenerDb();
	await db.withTransactionAsync(async () => {
		await db.runAsync(`DELETE FROM horarios WHERE lineaId = ?`, [lineaId]);
		for (const h of horarios) {
			await db.runAsync(
				`INSERT INTO horarios (id, lineaId, paradaId, sentido, tipoDeDia, hora) VALUES (?, ?, ?, ?, ?, ?)`,
				[h.id, h.lineaId, h.paradaId, h.sentido, h.tipoDeDia, h.hora],
			);
		}
	});
}

// Todos los horarios de la parada (todas las líneas, sentidos y tipos de día):
// de acá se calculan los "próximos" con proximosPorLinea() de utils/tablas.ts.
export async function obtenerHorariosDeParada(
	paradaId: string,
): Promise<Horario[]> {
	const db = await obtenerDb();
	return db.getAllAsync<Horario>(
		`SELECT id, lineaId, paradaId, sentido, tipoDeDia, hora FROM horarios WHERE paradaId = ? ORDER BY hora`,
		[paradaId],
	);
}

export async function obtenerHorarios(
	lineaId: string,
	paradaId: string,
	tipoDeDia: TipoDeDia,
): Promise<Horario[]> {
	const db = await obtenerDb();
	return db.getAllAsync<Horario>(
		`SELECT id, lineaId, paradaId, sentido, tipoDeDia, hora FROM horarios
     WHERE lineaId = ? AND paradaId = ? AND tipoDeDia = ? ORDER BY hora`,
		[lineaId, paradaId, tipoDeDia],
	);
}
