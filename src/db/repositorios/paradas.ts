import { obtenerDb } from '@/db';
import type { Parada, Sentido } from '@/tipos/types';

export async function guardarParadas(paradas: Parada[]): Promise<void> {
	const db = await obtenerDb();
	await db.withTransactionAsync(async () => {
		for (const p of paradas) {
			await db.runAsync(
				`INSERT INTO paradas (id, nombre, latitud, longitud, sentido, refugio, codigoQr, lineaIds)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           nombre = excluded.nombre, latitud = excluded.latitud, longitud = excluded.longitud,
           sentido = excluded.sentido, refugio = excluded.refugio, codigoQr = excluded.codigoQr,
           lineaIds = excluded.lineaIds`,
				[
					p.id,
					p.nombre,
					p.coordenadas.latitud,
					p.coordenadas.longitud,
					p.sentido,
					p.refugio ? 1 : 0,
					p.codigoQr,
					JSON.stringify(p.lineaIds),
				],
			);
		}
	});
}

type FilaParada = {
	id: string;
	nombre: string;
	latitud: number;
	longitud: number;
	sentido: Sentido;
	refugio: number;
	codigoQr: string | null;
	lineaIds: string;
};

function aParada(f: FilaParada): Parada {
	return {
		id: f.id,
		nombre: f.nombre,
		coordenadas: { latitud: f.latitud, longitud: f.longitud },
		lineaIds: JSON.parse(f.lineaIds),
		sentido: f.sentido,
		refugio: f.refugio === 1,
		codigoQr: f.codigoQr,
	};
}

export async function obtenerParadas(): Promise<Parada[]> {
	const db = await obtenerDb();
	const filas = await db.getAllAsync<FilaParada>(
		`SELECT * FROM paradas ORDER BY nombre`,
	);
	return filas.map(aParada);
}

export async function obtenerParada(id: string): Promise<Parada | null> {
	const db = await obtenerDb();
	const fila = await db.getFirstAsync<FilaParada>(
		`SELECT * FROM paradas WHERE id = ?`,
		[id],
	);
	return fila ? aParada(fila) : null;
}

export async function buscarParadasLocal(texto: string): Promise<Parada[]> {
	const db = await obtenerDb();
	const q = `%${texto.trim()}%`;
	const filas = await db.getAllAsync<FilaParada>(
		`SELECT * FROM paradas WHERE nombre LIKE ? COLLATE NOCASE ORDER BY nombre`,
		[q],
	);
	return filas.map(aParada);
}
