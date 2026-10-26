import { StyleSheet } from 'react-native';

import { espacio } from '@/tema';

// Proporciones de los PNG de assets/images/paran (marca 290×297, palabra 723×148).
const proporcionMarca = 290 / 297;
const proporcionPalabra = 723 / 148;

// Alto de la "P" en cada tamaño; la palabra mide la mitad de alto, como en el logotipo.
const altoMarca = { chico: 30, mediano: 40, grande: 56, portada: 76 } as const;

const marca = (alto: number) => ({ height: alto, aspectRatio: proporcionMarca });
const palabra = (alto: number) => ({ height: Math.round(alto / 2), aspectRatio: proporcionPalabra });

export const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: espacio.s },
  // Marca arriba y palabra abajo, centradas (panel del login).
  columna: { alignItems: 'center', gap: espacio.m },
  marcaChico: marca(altoMarca.chico),
  marcaMediano: marca(altoMarca.mediano),
  marcaGrande: marca(altoMarca.grande),
  marcaPortada: marca(altoMarca.portada),
  palabraChico: palabra(altoMarca.chico),
  palabraMediano: palabra(altoMarca.mediano),
  palabraGrande: palabra(altoMarca.grande),
  palabraPortada: palabra(altoMarca.portada),
});
