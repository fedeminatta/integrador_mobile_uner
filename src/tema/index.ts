import { useMemo } from 'react';
import { Platform } from 'react-native';

import { usePreferencias } from '@/hooks/usePreferencias';
import { Colores, coloresClaros, coloresOscuros } from '@/tema/paleta';

export * from '@/tema/medidas';
export * from '@/tema/paleta';

export type Tema = {
  colores: Colores;
  esOscuro: boolean;
};

export const temaClaro: Tema = { colores: coloresClaros, esOscuro: false };
export const temaOscuro: Tema = { colores: coloresOscuros, esOscuro: true };

export function useTema(): Tema {
  const { esOscuro } = usePreferencias();
  return esOscuro ? temaOscuro : temaClaro;
}

/**
 * Cada componente define sus estilos en su archivo `.estilos.ts` como
 * `crearEstilos(tema)`; este hook los arma con el tema actual.
 */
export function useEstilos<T>(crear: (tema: Tema) => T): T {
  const tema = useTema();
  return useMemo(() => crear(tema), [crear, tema]);
}

export function sombra(tema: Tema, nivel: 1 | 2 | 3 = 1) {
  const opacidad = tema.esOscuro ? 0.45 : 0.1 + nivel * 0.03;
  const alto = nivel * 3;
  return Platform.select({
    web: { boxShadow: `0px ${alto}px ${alto * 4}px rgba(${tema.esOscuro ? '0,0,0' : '4,41,90'},${opacidad})` },
    default: {
      shadowColor: tema.colores.sombra,
      shadowOpacity: opacidad,
      shadowRadius: alto * 3,
      shadowOffset: { width: 0, height: alto },
      elevation: nivel * 3,
    },
  });
}
