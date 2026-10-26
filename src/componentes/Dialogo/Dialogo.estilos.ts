import { StyleSheet } from 'react-native';

import { espacio, radio, sombra, Tema } from '@/tema';

export const crearEstilos = (tema: Tema) => {
  const { colores } = tema;
  return StyleSheet.create({
    velo: {
      flex: 1,
      backgroundColor: colores.velo,
      alignItems: 'center',
      justifyContent: 'center',
      padding: espacio.xl,
    },
    caja: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: colores.superficie,
      borderRadius: radio.modal,
      padding: espacio.xl,
      gap: espacio.m,
      alignItems: 'center',
      ...sombra(tema, 3),
    },
    icono: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colores.insignia,
      alignItems: 'center',
      justifyContent: 'center',
    },
    acciones: { alignSelf: 'stretch', marginTop: espacio.s },
  });
};
