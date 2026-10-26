import { StyleProp, Text, TextProps, TextStyle } from 'react-native';

import { crearEstilos } from '@/componentes/Texto/Texto.estilos';
import { useEstilos } from '@/tema';

export type VarianteTexto = 'titulo' | 'subtitulo' | 'cuerpo' | 'destacado' | 'chico' | 'etiqueta' | 'hora';
export type TonoTexto = 'suave' | 'error' | 'exito' | 'enlace' | 'encabezado';

type Props = TextProps & {
  variante?: VarianteTexto;
  tono?: TonoTexto;
  centrado?: boolean;
  style?: StyleProp<TextStyle>;
};

export function Texto({ variante = 'cuerpo', tono, centrado, style, ...resto }: Props) {
  const e = useEstilos(crearEstilos);
  return <Text {...resto} style={[e[variante], tono && e[tono], centrado && e.centrado, style]} />;
}
