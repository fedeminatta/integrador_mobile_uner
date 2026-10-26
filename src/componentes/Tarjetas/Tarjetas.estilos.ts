import { StyleSheet } from 'react-native';

import { espacio, fuentes, radio, tamanos, Tema } from '@/tema';

export const crearEstilos = ({ colores }: Tema) =>
  StyleSheet.create({
    textos: { flex: 1, minWidth: 0, gap: 2, marginLeft: espacio.m },
    hora: { alignItems: 'flex-end', marginLeft: espacio.m },
    insignias: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.xs, marginTop: espacio.xs },
    cabecera: { flexDirection: 'row', alignItems: 'center', gap: espacio.m },
    cabeceraTextos: { flex: 1, minWidth: 0 },
    chip: {
      alignSelf: 'flex-start',
      paddingHorizontal: espacio.s + 2,
      paddingVertical: 3,
      borderRadius: radio.pildora,
      marginTop: espacio.xs,
    },
    chipNormal: { backgroundColor: colores.fondoExito },
    chipDesvio: { backgroundColor: colores.insignia },
    chipTexto: { fontFamily: fuentes.seminegrita, fontSize: tamanos.etiqueta },
    chipTextoNormal: { color: colores.exito },
    chipTextoDesvio: { color: colores.sobreInsignia },
  });
