import { obtenerDb } from '@/db';
import type { Linea, Recorrido, Sentido } from '@/tipos/types';

export async function guardarLineas(lineas: Linea[]): Promise<void> {
	const db = await obtenerDb();
	await db.withTransactionAsync(async () => {
		for (const l of lineas) {
			await db.runAsync(
				`INSERT INTO lineas (id, numero, nombre, color, empresa, activa) VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           numero = excluded.numero, nombre = excluded.nombre, color = excluded.color,
           empresa = excluded.empresa, activa = excluded.activa`,
				[l.id, l.numero, l.nombre, l.color, l.empresa, l.activa ? 1 : 0],
			);
		}
	});
}

export async function guardarRecorridos(lineas: Linea[]): Promise<void> {
	const db = await obtenerDb();
	await db.withTransactionAsync(async () => {
		for (const l of lineas) {
			// Se recrean enteros: más simple que diffear ida/vuelta, y el cascade limpia recorrido_paradas.
			await db.runAsync(`DELETE FROM recorridos WHERE lineaId = ?`, [l.id]);
			for (const r of l.recorridos) {
				const recorridoId = `${l.id}:${r.sentido}`;
				await db.runAsync(
					`INSERT INTO recorridos (id, lineaId, sentido, destino, trazado) VALUES (?, ?, ?, ?, ?)`,
					[recorridoId, l.id, r.sentido, r.destino, JSON.stringify(r.trazado)],
				);
				for (let orden = 0; orden < r.paradaIds.length; orden++) {
					await db.runAsync(
						`INSERT INTO recorrido_paradas (recorridoId, orden, paradaId) VALUES (?, ?, ?)`,
						[recorridoId, orden, r.paradaIds[orden]],
					);
				}
			}
		}
	});
}

type FilaLinea = {
	id: string;
	numero: string;
	nombre: string;
	color: string;
	empresa: string;
	activa: number;
};
type FilaRecorrido = {
	id: string;
	lineaId: string;
	sentido: Sentido;
	destino: string;
	trazado: string;
};
type FilaRecorridoParada = {
	recorridoId: string;
	orden: number;
	paradaId: string;
};

export async function obtenerLineas(): Promise<Linea[]> {
	const db = await obtenerDb();
	const filasLineas = await db.getAllAsync<FilaLinea>(
		`SELECT * FROM lineas ORDER BY CAST(numero AS INTEGER), numero`,
	);
	const filasRecorridos = await db.getAllAsync<FilaRecorrido>(
		`SELECT * FROM recorridos`,
	);
	const filasRp = await db.getAllAsync<FilaRecorridoParada>(
		`SELECT * FROM recorrido_paradas ORDER BY recorridoId, orden`,
	);

	return filasLineas.map((fl) => {
		const recorridos: Recorrido[] = filasRecorridos
			.filter((fr) => fr.lineaId === fl.id)
			.map((fr) => ({
				sentido: fr.sentido,
				destino: fr.destino,
				trazado: JSON.parse(fr.trazado),
				paradaIds: filasRp
					.filter((rp) => rp.recorridoId === fr.id)
					.map((rp) => rp.paradaId),
			}));
		return {
			id: fl.id,
			numero: fl.numero,
			nombre: fl.nombre,
			color: fl.color,
			empresa: fl.empresa,
			activa: fl.activa === 1,
			recorridos,
		};
	});
}

export async function obtenerLinea(id: string): Promise<Linea | null> {
	const todas = await obtenerLineas();
	return todas.find((l) => l.id === id) ?? null;
}
