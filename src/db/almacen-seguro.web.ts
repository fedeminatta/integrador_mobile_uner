// expo-secure-store no existe en web. Para previsualizar en el navegador el
// token se guarda en sessionStorage (se borra al cerrar la pestaña).
const CLAVE_TOKEN = 'paran.token';

export async function leerToken(): Promise<string | null> {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
}

export async function guardarToken(token: string): Promise<void> {
  try {
    if (typeof window !== 'undefined') window.sessionStorage.setItem(CLAVE_TOKEN, token);
  } catch {
    // Sin almacenamiento: la sesión dura hasta recargar.
  }
}

export async function borrarToken(): Promise<void> {
  try {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(CLAVE_TOKEN);
  } catch {
    // Nada que borrar.
  }
}
