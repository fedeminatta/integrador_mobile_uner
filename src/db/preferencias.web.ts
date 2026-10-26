// En web (solo para previsualizar) se usa localStorage en lugar de kv-store.
export async function leerPreferencia(clave: string): Promise<string | null> {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(clave);
  } catch {
    return null;
  }
}

export async function guardarPreferencia(clave: string, valor: string): Promise<void> {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(clave, valor);
  } catch {
    // Sin almacenamiento disponible: la preferencia vale solo para esta sesión.
  }
}
