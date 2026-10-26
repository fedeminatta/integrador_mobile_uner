import Storage from 'expo-sqlite/kv-store';

// Preferencias simples en kv-store (nunca datos sensibles).
export async function leerPreferencia(clave: string): Promise<string | null> {
  try {
    return await Storage.getItemAsync(clave);
  } catch {
    return null;
  }
}

export async function guardarPreferencia(clave: string, valor: string): Promise<void> {
  try {
    await Storage.setItemAsync(clave, valor);
  } catch {
    // Si falla el guardado, la preferencia vale solo para esta sesión.
  }
}
