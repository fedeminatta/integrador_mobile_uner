import { StyleSheet } from 'react-native';

import { fuentes, radio, Tema } from '@/tema';

export const crearEstilos = ({ colores }: Tema) =>
  StyleSheet.create({
    insignia: {
      minWidth: 40,
      height: 40,
      paddingHorizontal: 6,
      borderRadius: radio.insignia,
      backgroundColor: colores.insignia,
      alignItems: 'center',
      justifyContent: 'center',
    },
    numero: { fontFamily: fuentes.negrita, fontSize: 16, color: colores.sobreInsignia, fontVariant: ['tabular-nums'] },
    chica: { minWidth: 30, height: 30, borderRadius: 9 },
    numeroChico: { fontSize: 13 },
  });
