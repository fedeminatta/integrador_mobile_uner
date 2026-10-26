import { useCallback, useEffect, useState } from 'react';

import { ErrorApi, Respuesta } from '@/tipos';

type EstadoCarga<T> = {
  datos: T | null;
  error: ErrorApi | null;
  cargando: boolean;
  recargar: () => void;
};

// Llama a un servicio y expone los estados carga / error / datos para las pantallas.
export function useCarga<T>(pedir: () => Promise<Respuesta<T>>): EstadoCarga<T> {
  const [datos, setDatos] = useState<T | null>(null);
  const [error, setError] = useState<ErrorApi | null>(null);
  const [cargando, setCargando] = useState(true);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    pedir()
      .then((r) => {
        if (!vigente) return;
        if ('error' in r) {
          setError(r.error);
          setDatos(null);
        } else {
          setDatos(r.datos);
          setError(null);
        }
      })
      .catch(() => {
        if (vigente) setError({ codigo: 'SIN_RESPUESTA', mensaje: 'No pudimos cargar los datos. Revisa la conexión y vuelve a intentarlo.' });
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [pedir, intento]);

  const recargar = useCallback(() => {
    setCargando(true);
    setIntento((n) => n + 1);
  }, []);

  return { datos, error, cargando, recargar };
}
