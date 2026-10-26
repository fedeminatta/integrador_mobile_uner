import { StyleSheet } from 'react-native';

import { espacio, radio, sombra, Tema } from '@/tema';

export const crearEstilos = (tema: Tema) => {
  const { colores } = tema;
  return StyleSheet.create({
    bloque: { backgroundColor: colores.esqueleto, borderRadius: 8 },
    // Medidas que imitan a los componentes reales.
    linea: { height: 14, width: '100%' },
    lineaCorta: { height: 12, width: '55%' },
    lineaTitulo: { height: 18, width: '70%' },
    insignia: { width: 40, height: 40, borderRadius: radio.insignia },
    hora: { width: 52, height: 26 },
    circulo: { width: 26, height: 26, borderRadius: 13 },
    campo: { height: 50, borderRadius: radio.campo },
    // Contenedores
    tarjeta: {
      alignSelf: 'stretch',
      backgroundColor: colores.superficie,
      borderRadius: radio.tarjeta,
      padding: espacio.l,
      flexDirection: 'row',
      alignItems: 'center',
      gap: espacio.m,
      ...sombra(tema, 1),
    },
    tarjetaColumna: { flexDirection: 'column', alignItems: 'stretch' },
    notificacion: {
      alignSelf: 'stretch',
      backgroundColor: colores.superficie,
      borderRadius: radio.aviso,
      borderLeftWidth: 5,
      borderLeftColor: colores.esqueleto,
      padding: espacio.m,
      flexDirection: 'row',
      gap: espacio.m,
      ...sombra(tema, 1),
    },
    acordeon: {
      alignSelf: 'stretch',
      backgroundColor: colores.superficie,
      borderRadius: radio.tarjeta,
      overflow: 'hidden',
      ...sombra(tema, 1),
    },
    filaAcordeon: { paddingVertical: espacio.l, paddingHorizontal: espacio.l },
    divisor: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colores.borde },
    textos: { flex: 1, gap: espacio.s },
    fila: { flexDirection: 'row', gap: espacio.s },
    lista: { alignSelf: 'stretch', gap: espacio.m },
  });
};
