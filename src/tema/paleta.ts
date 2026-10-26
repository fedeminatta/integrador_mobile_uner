// Colores del logotipo de Paran y sus derivados.
export const marca = {
  azul: '#04295a',
  azulMedio: '#0b4a8f',
  amarillo: '#f2b419',
  blanco: '#ffffff',
} as const;

export type Colores = {
  fondo: string;
  superficie: string;
  superficieTenue: string;
  texto: string;
  textoSuave: string;
  titulo: string;
  borde: string;
  enlace: string;
  foco: string;
  primario: string;
  sobrePrimario: string;
  secundario: string;
  sobreSecundario: string;
  encabezado: string;
  sobreEncabezado: string;
  insignia: string;
  sobreInsignia: string;
  tabActiva: string;
  sobreTabActiva: string;
  velo: string;
  esqueleto: string;
  sombra: string;
  error: string;
  fondoError: string;
  exito: string;
  fondoExito: string;
  advertencia: string;
};

export const coloresClaros: Colores = {
  fondo: '#f6f8fc',
  superficie: '#ffffff',
  superficieTenue: '#eef3fa',
  texto: '#14223a',
  textoSuave: '#5f6b7e',
  titulo: marca.azul,
  borde: '#d3dae6',
  enlace: marca.azulMedio,
  foco: marca.amarillo,
  primario: marca.azul,
  sobrePrimario: marca.blanco,
  secundario: '#eef3fa',
  sobreSecundario: marca.azul,
  encabezado: marca.amarillo,
  sobreEncabezado: marca.azul,
  insignia: marca.amarillo,
  sobreInsignia: marca.azul,
  tabActiva: marca.amarillo,
  sobreTabActiva: marca.azul,
  velo: 'rgba(4, 22, 48, 0.55)',
  esqueleto: '#e2e8f1',
  sombra: marca.azul,
  error: '#b3261e',
  fondoError: '#fdecea',
  exito: '#1e7a4f',
  fondoExito: '#e6f5ec',
  advertencia: marca.amarillo,
};

export const coloresOscuros: Colores = {
  fondo: '#061a38',
  superficie: '#0d2a52',
  superficieTenue: '#0f3160',
  texto: '#e6edf7',
  textoSuave: '#9fb0c9',
  titulo: '#ffffff',
  borde: '#24446f',
  enlace: marca.amarillo,
  foco: marca.amarillo,
  primario: marca.amarillo,
  sobrePrimario: marca.azul,
  secundario: '#16396b',
  sobreSecundario: '#e6edf7',
  encabezado: marca.amarillo,
  sobreEncabezado: marca.azul,
  insignia: marca.amarillo,
  sobreInsignia: marca.azul,
  tabActiva: marca.amarillo,
  sobreTabActiva: marca.azul,
  velo: 'rgba(0, 0, 0, 0.6)',
  esqueleto: '#163762',
  sombra: '#000000',
  error: '#ff8a80',
  fondoError: '#3a1820',
  exito: '#6fd6a0',
  fondoExito: '#12382c',
  advertencia: marca.amarillo,
};
