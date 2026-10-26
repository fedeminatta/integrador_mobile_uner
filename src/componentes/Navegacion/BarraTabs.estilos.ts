import { StyleSheet } from 'react-native';

import { espacio, fuentes, radio, sombra, Tema } from '@/tema';

export const crearEstilos = (tema: Tema) => {
  const { colores } = tema;
  return StyleSheet.create({
    // Capa que flota sobre el contenido sin ocupar lugar en el layout.
    capa: { position: 'absolute', left: 0, right: 0, bottom: 0 },
    zona: { paddingHorizontal: espacio.l, paddingBottom: espacio.m },
    barra: {
      width: '100%',
      maxWidth: 480,
      alignSelf: 'center',
      flexDirection: 'row',
      padding: espacio.xs + 2,
      gap: espacio.xs,
      borderRadius: radio.modal + 4,
      backgroundColor: colores.superficie,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colores.borde,
      ...sombra(tema, 3),
    },
    tab: {
      flex: 1,
      minHeight: 54,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      borderRadius: radio.modal,
    },
    tabActiva: { backgroundColor: colores.tabActiva },
    tabPresionada: { opacity: 0.7 },
    etiqueta: { fontFamily: fuentes.media, fontSize: 11, color: colores.textoSuave },
    etiquetaActiva: { fontFamily: fuentes.seminegrita, color: colores.sobreTabActiva },
  });
};
