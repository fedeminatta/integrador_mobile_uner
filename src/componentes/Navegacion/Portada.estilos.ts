import { StyleSheet } from 'react-native';

import { espacio, fuentes, radio, sombra, tamanos, Tema } from '@/tema';

export const crearEstilos = (tema: Tema) => {
  const { colores } = tema;
  return StyleSheet.create({
    // Panel amarillo del login: logo centrado y esquinas de abajo bien redondeadas.
    panel: {
      backgroundColor: colores.encabezado,
      borderBottomLeftRadius: radio.portada,
      borderBottomRightRadius: radio.portada,
      ...sombra(tema, 2),
    },
    interior: {
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
      paddingHorizontal: espacio.l,
      paddingTop: espacio.s,
      paddingBottom: espacio.xxl,
    },
    fila: { flexDirection: 'row', justifyContent: 'space-between' },
    botonIcono: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(4, 41, 90, 0.08)',
    },
    presionado: { opacity: 0.6 },
    marca: { alignItems: 'center', gap: espacio.m, marginTop: -espacio.s },
    leyenda: {
      fontFamily: fuentes.seminegrita,
      fontSize: tamanos.etiqueta,
      lineHeight: 16,
      letterSpacing: 3,
      textAlign: 'center',
      color: colores.sobreEncabezado,
    },
  });
};
