import { ErrorApi, Respuesta } from '@/tipos';

// Simula la latencia de la API mientras se usan mocks.
const LATENCIA_MS = 700;

export function esperar(ms = LATENCIA_MS) {
  return new Promise<void>((resolver) => setTimeout(resolver, ms));
}

export async function responder<T>(datos: T): Promise<Respuesta<T>> {
  await esperar();
  return {
    datos,
    meta: { generadoEn: new Date().toISOString(), total: Array.isArray(datos) ? datos.length : null },
  };
}

export async function fallar<T>(error: ErrorApi): Promise<Respuesta<T>> {
  await esperar();
  return { error };
}
