import { useCallback, useEffect, useSyncExternalStore } from 'react';

import { guardarPreferencia, leerPreferencia } from '@/db/preferencias';

// Últimas paradas que se abrieron, la más reciente primero. Se guardan en el teléfono.
const CLAVE = 'paran.paradasRecientes';
const MAXIMO = 5;

let actuales: string[] = [];
let cargadas = false;
const oyentes = new Set<() => void>();

function avisar() {
  oyentes.forEach((oyente) => oyente());
}

async function cargar() {
  if (cargadas) return;
  cargadas = true;
  try {
    const texto = await leerPreferencia(CLAVE);
    actuales = texto ? JSON.parse(texto) : [];
  } catch {
    actuales = [];
  }
  avisar();
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

export function useRecientes() {
  const recientes = useSyncExternalStore(suscribir, () => actuales);

  useEffect(() => {
    cargar();
  }, []);

  const registrar = useCallback((paradaId: string) => {
    actuales = [paradaId, ...actuales.filter((id) => id !== paradaId)].slice(0, MAXIMO);
    avisar();
    guardarPreferencia(CLAVE, JSON.stringify(actuales));
  }, []);

  return { recientes, registrar };
}
