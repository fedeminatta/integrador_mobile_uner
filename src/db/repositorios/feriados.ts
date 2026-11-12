import { obtenerDb } from '@/db';

export async function guardarFeriados(fechas: string[]): Promise<void> {
	const db = await obtenerDb();
	await db.withTransactionAsync(async () => {
		for (const fecha of fechas) {
			await db.runAsync(
				`INSERT INTO feriados (fecha) VALUES (?) ON CONFLICT(fecha) DO NOTHING`,
				[fecha],
			);
		}
	});
}

export async function obtenerFeriados(): Promise<string[]> {
	const db = await obtenerDb();
	const filas = await db.getAllAsync<{ fecha: string }>(
		`SELECT fecha FROM feriados ORDER BY fecha`,
	);
	return filas.map((f) => f.fecha);
}
