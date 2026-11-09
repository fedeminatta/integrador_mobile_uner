import { StyleSheet } from 'react-native';

import { radio, Tema } from '@/tema';

export const crearEstilos = ({ colores }: Tema) =>
  StyleSheet.create({
    mapa: {
      width: '100%',
      height: 220,
      borderRadius: radio.tarjeta,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colores.borde,
    },
  });