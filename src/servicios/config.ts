const url = process.env.EXPO_PUBLIC_API_URL;

if (!url) {
	console.warn(
		'Falta EXPO_PUBLIC_API_URL en el .env. Copiá .env.example como .env y poné la IP de la API.',
	);
}

// Sin barra final, para poder escribir `${API_URL}/lineas`.
export const API_URL = (url ?? '').replace(/\/+$/, '');

// Margen largo: la API publicada en Render tarda cerca de un minuto en despertar.
export const TIMEOUT_MS = 30000;
