import { StyleSheet } from 'react-native';

import { espacio, Tema } from '@/tema';

export const crearEstilos = ({ colores }: Tema) =>
  StyleSheet.create({
    fila: { flexDirection: 'row', alignItems: 'center', gap: espacio.m },
    linea: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colores.borde },
  });
