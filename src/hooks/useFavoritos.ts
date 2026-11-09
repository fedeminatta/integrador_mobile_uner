import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';

import { guardarPreferencia, leerPreferencia } from '@/db/preferencias';

// Favoritos guardados en el teléfono: funcionan sin cuenta y sin conexión.
// Todas las pantallas comparten la misma copia en memoria.
type Favoritos = { lineas: string[]; paradas: string[] };
type Tipo = keyof Favoritos;

const claves: Record<Tipo, string> = { lineas: 'paran.favoritos.lineas', paradas: 'paran.favoritos.paradas' };

let actuales: Favoritos = { lineas: [], paradas: [] };
let cargados = false;
const oyentes = new Set<() => void>();

function avisar() {
  oyentes.forEach((oyente) => oyente());
}

async function cargar() {
  if (cargados) return;
  cargados = true;
  const [lineas, paradas] = await Promise.all([leerPreferencia(claves.lineas), leerPreferencia(claves.paradas)]);
  const leer = (texto: string | null): string[] => {
    try {
      return texto ? JSON.parse(texto) : [];
    } catch {
      return [];
    }
  };
  actuales = { lineas: leer(lineas), paradas: leer(paradas) };
  avisar();
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

export function useFavoritos() {
  const favoritos = useSyncExternalStore(suscribir, () => actuales);

  useEffect(() => {
    cargar();
  }, []);

  const alternar = useCallback((tipo: Tipo, id: string) => {
    const lista = actuales[tipo];
    // Se agregan al final: la pantalla de inicio los muestra en el orden en que se marcaron.
    const nueva = lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id];
    actuales = { ...actuales, [tipo]: nueva };
    avisar();
    guardarPreferencia(claves[tipo], JSON.stringify(nueva));
  }, []);

  return useMemo(
    () => ({
      lineas: favoritos.lineas,
      paradas: favoritos.paradas,
      esLineaFavorita: (id: string) => favoritos.lineas.includes(id),
      esParadaFavorita: (id: string) => favoritos.paradas.includes(id),
      alternarLinea: (id: string) => alternar('lineas', id),
      alternarParada: (id: string) => alternar('paradas', id),
    }),
    [favoritos, alternar],
  );
}
