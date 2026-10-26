import { StyleSheet } from 'react-native';

import { espacio, radio, sombra, Tema } from '@/tema';

export const crearEstilos = (tema: Tema) =>
  StyleSheet.create({
    tarjeta: {
      alignSelf: 'stretch',
      backgroundColor: tema.colores.superficie,
      borderRadius: radio.tarjeta,
      padding: espacio.l,
      gap: espacio.m,
      ...sombra(tema, 1),
    },
    fila: { flexDirection: 'row', alignItems: 'center' },
    sinRelleno: { padding: 0, gap: 0, overflow: 'hidden' },
    presionada: { opacity: 0.9 },
  });
