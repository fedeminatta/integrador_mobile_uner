import { obtenerDb } from '@/db';
import type { Usuario } from '@/tipos/types';

// reportes.usuarioId tiene FK a usuario(id): antes de encolar un reporte offline
// hace falta que exista esa fila local (no se persiste el usuario en ningún otro lado).
export async function upsertUsuarioLocal(u: Usuario): Promise<void> {
	const db = await obtenerDb();
	await db.runAsync(
		`INSERT INTO usuario (id, nombre, email, creadoEn) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET nombre = excluded.nombre, email = excluded.email`,
		[u.id, u.nombre, u.email, new Date().toISOString()],
	);
}
