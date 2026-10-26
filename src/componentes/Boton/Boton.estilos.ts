import { StyleSheet } from 'react-native';

import { alturaControl, espacio, fuentes, radio, sombra, tamanos, Tema } from '@/tema';

export const crearEstilos = (tema: Tema) => {
  const { colores } = tema;
  return StyleSheet.create({
    // Siempre ancho completo: los textos largos bajan de renglón en vez de cortarse.
    base: {
      alignSelf: 'stretch',
      minHeight: alturaControl,
      borderRadius: radio.campo,
      paddingVertical: espacio.m,
      paddingHorizontal: espacio.l,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: espacio.s,
    },
    primario: { backgroundColor: colores.primario, ...sombra(tema, 2) },
    secundario: { backgroundColor: colores.secundario },
    texto: { backgroundColor: 'transparent' },
    peligro: { backgroundColor: colores.fondoError },
    presionado: { opacity: 0.85, transform: [{ scale: 0.99 }] },
    deshabilitado: { opacity: 0.5 },
    etiqueta: {
      flexShrink: 1,
      textAlign: 'center',
      fontFamily: fuentes.seminegrita,
      fontSize: tamanos.cuerpo,
      lineHeight: 20,
    },
    etiquetaPrimario: { color: colores.sobrePrimario },
    etiquetaSecundario: { color: colores.sobreSecundario },
    etiquetaTexto: { color: colores.enlace },
    etiquetaPeligro: { color: colores.error },
  });
};
