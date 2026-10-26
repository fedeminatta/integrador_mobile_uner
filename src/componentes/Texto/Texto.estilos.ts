import { StyleSheet } from 'react-native';

import { fuentes, tamanos, Tema } from '@/tema';

export const crearEstilos = ({ colores }: Tema) =>
  StyleSheet.create({
    titulo: { fontFamily: fuentes.negrita, fontSize: tamanos.titulo, lineHeight: 30, color: colores.titulo },
    subtitulo: { fontFamily: fuentes.seminegrita, fontSize: tamanos.subtitulo, lineHeight: 24, color: colores.titulo },
    cuerpo: { fontFamily: fuentes.regular, fontSize: tamanos.cuerpo, lineHeight: 21, color: colores.texto },
    destacado: { fontFamily: fuentes.seminegrita, fontSize: tamanos.cuerpo, lineHeight: 21, color: colores.titulo },
    chico: { fontFamily: fuentes.regular, fontSize: tamanos.chico, lineHeight: 18, color: colores.textoSuave },
    etiqueta: {
      fontFamily: fuentes.seminegrita,
      fontSize: tamanos.etiqueta,
      lineHeight: 16,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colores.textoSuave,
    },
    hora: {
      fontFamily: fuentes.negrita,
      fontSize: tamanos.hora,
      lineHeight: 26,
      color: colores.titulo,
      fontVariant: ['tabular-nums'],
    },
    // Tonos que pisan el color de la variante.
    suave: { color: colores.textoSuave },
    error: { color: colores.error },
    exito: { color: colores.exito },
    enlace: { color: colores.enlace },
    encabezado: { color: colores.sobreEncabezado },
    centrado: { textAlign: 'center' },
  });
