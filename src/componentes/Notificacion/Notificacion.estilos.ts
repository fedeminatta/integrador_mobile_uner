import { StyleSheet } from 'react-native';

import { espacio, fuentes, radio, sombra, tamanos, Tema } from '@/tema';

// Superficie clara con barra lateral de color.
export const crearEstilos = (tema: Tema) => {
  const { colores } = tema;
  return StyleSheet.create({
    contenedor: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: espacio.m,
      paddingVertical: espacio.m,
      paddingLeft: espacio.m,
      paddingRight: espacio.s,
      borderRadius: radio.aviso,
      borderLeftWidth: 5,
      backgroundColor: colores.superficie,
      ...sombra(tema, 2),
    },
    aviso: { borderLeftColor: colores.advertencia },
    info: { borderLeftColor: colores.enlace },
    error: { borderLeftColor: colores.error },
    exito: { borderLeftColor: colores.exito },
    icono: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    iconoAviso: { backgroundColor: colores.advertencia },
    iconoInfo: { backgroundColor: colores.superficieTenue },
    iconoError: { backgroundColor: colores.fondoError },
    iconoExito: { backgroundColor: colores.fondoExito },
    textos: { flex: 1, minWidth: 0, gap: 2 },
    titulo: { fontFamily: fuentes.seminegrita, fontSize: tamanos.cuerpo, lineHeight: 20, color: colores.titulo },
    mensaje: { fontFamily: fuentes.regular, fontSize: tamanos.chico, lineHeight: 18, color: colores.texto },
    cerrar: { padding: espacio.xs },
  });
};
