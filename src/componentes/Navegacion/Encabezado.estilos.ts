import { StyleSheet } from 'react-native';

import { espacio, radio, sombra, Tema } from '@/tema';

export const crearEstilos = (tema: Tema) => {
  const { colores } = tema;
  return StyleSheet.create({
    // Panel amarillo con las esquinas de abajo redondeadas.
    panel: {
      backgroundColor: colores.encabezado,
      borderBottomLeftRadius: radio.encabezado,
      borderBottomRightRadius: radio.encabezado,
      ...sombra(tema, 2),
    },
    interior: {
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
      paddingHorizontal: espacio.l,
      paddingTop: espacio.s,
      paddingBottom: espacio.l,
      gap: espacio.m,
    },
    fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: espacio.s },
    // El título ocupa el espacio libre entre el monograma (o la flecha) y los botones.
    titulo: { flex: 1, minWidth: 0 },
    // Fondo blanco para que la parte amarilla de la marca se vea sobre el encabezado amarillo.
    botonLogo: {
      width: 44,
      height: 44,
      flexShrink: 0,
      borderRadius: radio.insignia,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
    },
    botonIcono: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(4, 41, 90, 0.08)',
    },
    presionado: { opacity: 0.6 },
  });
};
