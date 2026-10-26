import { ActivityIndicator, Pressable, Text } from 'react-native';

import { crearEstilos } from '@/componentes/Boton/Boton.estilos';
import { Icono, NombreIcono } from '@/componentes/Icono/Icono';
import { useHaptica } from '@/hooks/useHaptica';
import { Colores, useEstilos, useTema } from '@/tema';

export type VarianteBoton = 'primario' | 'secundario' | 'texto' | 'peligro';

type Props = {
  texto: string;
  onPress: () => void;
  variante?: VarianteBoton;
  icono?: NombreIcono;
  cargando?: boolean;
  deshabilitado?: boolean;
};

const etiquetaPorVariante = {
  primario: 'etiquetaPrimario',
  secundario: 'etiquetaSecundario',
  texto: 'etiquetaTexto',
  peligro: 'etiquetaPeligro',
} as const;

const colorPorVariante: Record<VarianteBoton, keyof Colores> = {
  primario: 'sobrePrimario',
  secundario: 'sobreSecundario',
  texto: 'enlace',
  peligro: 'error',
};

export function Boton({ texto, onPress, variante = 'primario', icono, cargando, deshabilitado }: Props) {
  const e = useEstilos(crearEstilos);
  const { colores } = useTema();
  const haptica = useHaptica();
  const inactivo = deshabilitado || cargando;

  const presionar = () => {
    haptica.toque();
    onPress();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: cargando }}
      disabled={inactivo}
      onPress={presionar}
      style={({ pressed }) => [e.base, e[variante], pressed && e.presionado, inactivo && e.deshabilitado]}>
      {cargando ? (
        <ActivityIndicator color={colores[colorPorVariante[variante]]} />
      ) : (
        icono && <Icono nombre={icono} tamano={20} color={colorPorVariante[variante]} />
      )}
      <Text style={[e.etiqueta, e[etiquetaPorVariante[variante]]]}>{texto}</Text>
    </Pressable>
  );
}
