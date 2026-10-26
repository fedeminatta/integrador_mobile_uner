import * as SecureStore from 'expo-secure-store';

// El token de sesión vive solo aquí (expo-secure-store), nunca en kv-store.
const CLAVE_TOKEN = 'paran.token';

export async function leerToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(CLAVE_TOKEN);
  } catch {
    return null;
  }
}

export async function guardarToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(CLAVE_TOKEN, token);
}

export async function borrarToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(CLAVE_TOKEN);
  } catch {
    // No había token guardado.
  }
}
