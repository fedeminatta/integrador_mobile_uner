import { StyleSheet } from 'react-native';

import { espacio, radio, Tema } from '@/tema';

export const crearEstilos = ({ colores }: Tema) =>
  StyleSheet.create({
    vacio: {
      alignSelf: 'stretch',
      alignItems: 'center',
      gap: espacio.s,
      paddingVertical: espacio.xl,
      paddingHorizontal: espacio.l,
      borderRadius: radio.tarjeta,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colores.borde,
    },
    iconoVacio: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colores.superficieTenue,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: espacio.xs,
    },
    error: { alignSelf: 'stretch', gap: espacio.m },
  });
