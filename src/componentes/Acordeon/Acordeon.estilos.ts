import { StyleSheet } from 'react-native';

import { espacio, fuentes, radio, sombra, tamanos, Tema } from '@/tema';

// Acordeón agrupado: una sola tarjeta con divisores; el ítem abierto se tiñe.
export const crearEstilos = (tema: Tema) => {
  const { colores } = tema;
  return StyleSheet.create({
    grupo: {
      alignSelf: 'stretch',
      backgroundColor: colores.superficie,
      borderRadius: radio.tarjeta,
      overflow: 'hidden',
      ...sombra(tema, 1),
    },
    item: {},
    divisor: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colores.borde },
    abierto: { backgroundColor: colores.superficieTenue },
    cabecera: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: espacio.m,
      paddingVertical: espacio.m + 2,
      paddingHorizontal: espacio.l,
    },
    cabeceraPresionada: { opacity: 0.7 },
    titulo: { flex: 1, minWidth: 0, fontFamily: fuentes.seminegrita, fontSize: tamanos.cuerpo, color: colores.titulo },
    cuerpo: { paddingHorizontal: espacio.l, paddingBottom: espacio.l, gap: espacio.s },
  });
};
