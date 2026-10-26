import { DarkTheme, DefaultTheme, Theme } from 'expo-router';

import { Tema } from '@/tema';

// Tema de React Navigation armado con nuestros colores (evita fondos blancos en modo oscuro).
export function temaDeNavegacion({ colores, esOscuro }: Tema): Theme {
  const base = esOscuro ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colores.primario,
      background: colores.fondo,
      card: colores.superficie,
      text: colores.texto,
      border: colores.borde,
      notification: colores.insignia,
    },
  };
}
