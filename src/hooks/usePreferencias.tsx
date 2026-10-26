import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { guardarPreferencia, leerPreferencia } from '@/db/preferencias';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ModoTema = 'sistema' | 'claro' | 'oscuro';

type Preferencias = {
  modoTema: ModoTema;
  esOscuro: boolean;
  haptica: boolean;
  cargadas: boolean;
  cambiarModoTema: (modo: ModoTema) => void;
  cambiarHaptica: (activa: boolean) => void;
};

const CLAVE_TEMA = 'preferencias.tema';
const CLAVE_HAPTICA = 'preferencias.haptica';

const ContextoPreferencias = createContext<Preferencias | null>(null);

export function ProveedorPreferencias({ children }: { children: ReactNode }) {
  const esquemaSistema = useColorScheme();
  const [modoTema, setModoTema] = useState<ModoTema>('sistema');
  const [haptica, setHaptica] = useState(true);
  const [cargadas, setCargadas] = useState(false);

  useEffect(() => {
    Promise.all([leerPreferencia(CLAVE_TEMA), leerPreferencia(CLAVE_HAPTICA)]).then(([tema, hap]) => {
      if (tema === 'claro' || tema === 'oscuro' || tema === 'sistema') setModoTema(tema);
      if (hap !== null) setHaptica(hap === 'si');
      setCargadas(true);
    });
  }, []);

  const cambiarModoTema = useCallback((modo: ModoTema) => {
    setModoTema(modo);
    guardarPreferencia(CLAVE_TEMA, modo);
  }, []);

  const cambiarHaptica = useCallback((activa: boolean) => {
    setHaptica(activa);
    guardarPreferencia(CLAVE_HAPTICA, activa ? 'si' : 'no');
  }, []);

  const esOscuro = modoTema === 'sistema' ? esquemaSistema === 'dark' : modoTema === 'oscuro';

  const valor = useMemo(
    () => ({ modoTema, esOscuro, haptica, cargadas, cambiarModoTema, cambiarHaptica }),
    [modoTema, esOscuro, haptica, cargadas, cambiarModoTema, cambiarHaptica],
  );

  return <ContextoPreferencias.Provider value={valor}>{children}</ContextoPreferencias.Provider>;
}

export function usePreferencias(): Preferencias {
  const ctx = useContext(ContextoPreferencias);
  if (!ctx) throw new Error('usePreferencias debe usarse dentro de ProveedorPreferencias');
  return ctx;
}
