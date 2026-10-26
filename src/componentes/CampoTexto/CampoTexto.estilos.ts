import { StyleSheet } from 'react-native';

import { alturaControl, espacio, fuentes, radio, tamanos, Tema } from '@/tema';

export const crearEstilos = ({ colores }: Tema) =>
  StyleSheet.create({
    contenedor: { alignSelf: 'stretch', gap: espacio.xs },
    etiqueta: { fontFamily: fuentes.seminegrita, fontSize: tamanos.chico, color: colores.textoSuave },
    caja: {
      minHeight: alturaControl,
      borderRadius: radio.campo,
      borderWidth: 1,
      borderColor: colores.borde,
      backgroundColor: colores.superficie,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: espacio.l,
      gap: espacio.s,
    },
    cajaFoco: { borderWidth: 2, borderColor: colores.foco, paddingHorizontal: espacio.l - 1 },
    cajaError: { borderWidth: 2, borderColor: colores.error, paddingHorizontal: espacio.l - 1 },
    entrada: {
      flex: 1,
      minWidth: 0,
      paddingVertical: espacio.m,
      fontFamily: fuentes.regular,
      fontSize: tamanos.cuerpo,
      color: colores.texto,
    },
    ojo: { padding: espacio.xs },
    mensajeError: { fontFamily: fuentes.media, fontSize: tamanos.chico, color: colores.error },
  });
