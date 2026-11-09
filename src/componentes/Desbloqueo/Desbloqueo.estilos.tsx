import { StyleSheet } from 'react-native';

import { Tema } from '@/tema';

export const crearEstilos = ({ colores }: Tema) =>
  StyleSheet.create({
    fondo: { flex: 1, backgroundColor: colores.fondo },
    marca: { alignItems: 'center' },
  });