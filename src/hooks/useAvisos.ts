import { useEffect, useState } from 'react';

import { avisosVistas, AvisoVista } from '@/servicios/avisosApi';
import { avisarAvisosNuevos } from '@/servicios/notificaciones';
import { ErrorApi } from '@/tipos';

// Carga avisos reales, sincroniza notificaciones 
export function useAvisos() {
  const [datos, setDatos] = useState<AvisoVista[] | null>(null);
  const [error, setError] = useState<ErrorApi | null>(null);
  const [cargando, setCargando] = useState(true);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const r = await avisosVistas();
      if (!vivo) return;
      if ('error' in r) {
        setError(r.error);
        setCargando(false);
        return;
      }
      setDatos(r.datos);
      setError(null);
      setCargando(false);
      avisarAvisosNuevos(r.datos).catch(() => {}); 
    })();
    return () => {
      vivo = false;
    };
  }, [intento]);

  const recargar = () => {
    setCargando(true);
    setIntento((i) => i + 1);
  };

  return { datos, error, cargando, recargar };
}