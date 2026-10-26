import { StyleSheet } from 'react-native';

import { espacio, Tema } from '@/tema';

export const crearEstilos = ({ colores }: Tema) =>
  StyleSheet.create({
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: espacio.m,
      paddingVertical: espacio.m,
      paddingHorizontal: espacio.l,
      minHeight: 56,
    },
    divisor: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colores.borde },
    presionada: { backgroundColor: colores.superficieTenue },
    textos: { flex: 1, minWidth: 0, gap: 2 },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colores.borde,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioActivo: { borderColor: colores.primario },
    punto: { width: 10, height: 10, borderRadius: 5, backgroundColor: colores.primario },
  });
