import { StyleSheet } from 'react-native';

import { espacio, fuentes, radio, tamanos, Tema } from '@/tema';

export const crearEstilos = ({ colores }: Tema) =>
  StyleSheet.create({
    cajon: { backgroundColor: colores.superficie, width: 300 },
    contenedor: { flex: 1, backgroundColor: colores.superficie },
    desplazable: { paddingHorizontal: espacio.m, paddingBottom: espacio.xl, gap: espacio.l },
    cabecera: { paddingHorizontal: espacio.s, paddingTop: espacio.l, gap: espacio.s },
    usuario: {
      marginTop: espacio.s,
      padding: espacio.m,
      borderRadius: radio.tarjeta,
      backgroundColor: colores.superficieTenue,
      gap: 2,
    },
    grupo: { gap: 2 },
    tituloGrupo: { paddingHorizontal: espacio.s, marginBottom: espacio.xs },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: espacio.m,
      minHeight: 48,
      paddingHorizontal: espacio.m,
      borderRadius: radio.campo,
    },
    itemActivo: { backgroundColor: colores.insignia },
    itemPresionado: { backgroundColor: colores.superficieTenue },
    textoItem: { flex: 1, fontFamily: fuentes.media, fontSize: tamanos.cuerpo, color: colores.texto },
    textoItemActivo: { fontFamily: fuentes.seminegrita, color: colores.sobreInsignia },
  });
