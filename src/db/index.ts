import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import { migrar, VERSION_ACTUAL } from './migraciones';

const NOMBRE_DB = 'paran.db';

let promesaDb: Promise<SQLiteDatabase> | null = null;

export function obtenerDb(): Promise<SQLiteDatabase> {
	if (!promesaDb) {
		promesaDb = (async () => {
			const db = await openDatabaseAsync(NOMBRE_DB);

			await db.execAsync(
				'PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;',
			);
			await migrar(db);
			return db;
		})().catch((error) => {
			promesaDb = null; // si falla, permitir reintentar
			throw error;
		});
	}
	return promesaDb;
}

export async function diagnosticoDb() {
	const db = await obtenerDb();
	const tablas = await db.getAllAsync<{ name: string }>(
		"SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
	);
	const fk = await db.getFirstAsync<{ foreign_keys: number }>(
		'PRAGMA foreign_keys',
	);
	const version = await db.getFirstAsync<{ user_version: number }>(
		'PRAGMA user_version',
	);
	const motivos = await db.getFirstAsync<{ total: number }>(
		'SELECT COUNT(*) AS total FROM motivos_demora',
	);

	return {
		tablas: tablas.map((t) => t.name),
		cantidadTablas: tablas.length, // esperado: 13
		foreignKeys: fk?.foreign_keys === 1, // esperado: true
		version: version?.user_version, // esperado: VERSION_ACTUAL
		versionEsperada: VERSION_ACTUAL,
		motivosCargados: motivos?.total, // esperado: 5
	};
}
