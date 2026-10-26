import type { SQLiteDatabase } from 'expo-sqlite';
import {
	SQL_DATOS_INICIALES_V1,
	SQL_INDICES_V1,
	SQL_TABLAS_V1,
} from './esquema';

const MIGRACIONES: Array<(db: SQLiteDatabase) => Promise<void>> = [
	async (db) => {
		await db.execAsync(SQL_TABLAS_V1);
		await db.execAsync(SQL_INDICES_V1);
		await db.execAsync(SQL_DATOS_INICIALES_V1);
	},
];

export const VERSION_ACTUAL = MIGRACIONES.length;

export async function migrar(db: SQLiteDatabase): Promise<void> {
	const fila = await db.getFirstAsync<{ user_version: number }>(
		'PRAGMA user_version',
	);
	const versionActual = fila?.user_version ?? 0;

	for (let v = versionActual; v < MIGRACIONES.length; v++) {
		await db.withTransactionAsync(async () => {
			await MIGRACIONES[v](db);
			// PRAGMA no acepta parámetros, el numero sale del array
			await db.execAsync(`PRAGMA user_version = ${v + 1}`);
		});
	}
}
