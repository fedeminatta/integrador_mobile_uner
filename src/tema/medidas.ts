// Redondeo amplio, sombras suaves.
export const espacio = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radio = {
  campo: 16,
  tarjeta: 16,
  modal: 20,
  aviso: 14,
  insignia: 12,
  encabezado: 28,
  portada: 40,
  pildora: 999,
} as const;

export const alturaControl = 50;

// Espacio que deja libre la barra de tabs flotante al final de cada pantalla.
export const espacioBarraTabs = 112;

export const fuentes = {
  regular: 'Rubik_400Regular',
  media: 'Rubik_500Medium',
  seminegrita: 'Rubik_600SemiBold',
  negrita: 'Rubik_700Bold',
} as const;

export const tamanos = {
  titulo: 24,
  subtitulo: 18,
  cuerpo: 15,
  chico: 13,
  etiqueta: 12,
  hora: 22,
} as const;
