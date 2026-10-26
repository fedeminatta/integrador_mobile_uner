import { StyleSheet } from 'react-native';

import { espacio, Tema } from '@/tema';

export const crearEstilos = ({ colores }: Tema) =>
  StyleSheet.create({
    // Spinner y texto alineados a la izquierda, como el logo del encabezado.
    fila: { flexDirection: 'row', alignItems: 'center', gap: espacio.m, alignSelf: 'flex-start' },
    centro: { alignSelf: 'center' },
    marco: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
    anillo: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 52,
      height: 52,
      borderRadius: 26,
      borderWidth: 3,
      borderColor: colores.superficieTenue,
      borderTopColor: colores.insignia,
      borderRightColor: colores.insignia,
    },
  });
