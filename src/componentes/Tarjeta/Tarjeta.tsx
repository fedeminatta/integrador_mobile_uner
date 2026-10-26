import { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { crearEstilos } from '@/componentes/Tarjeta/Tarjeta.estilos';
import { useEstilos } from '@/tema';

type Props = {
  children: ReactNode;
  enFila?: boolean;
  // Para listas de filas que ya traen su propio relleno.
  sinRelleno?: boolean;
  onPress?: () => void;
  etiquetaAccesible?: string;
};

export function Tarjeta({ children, enFila, sinRelleno, onPress, etiquetaAccesible }: Props) {
  const e = useEstilos(crearEstilos);
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={etiquetaAccesible}
        onPress={onPress}
        style={({ pressed }) => [e.tarjeta, enFila && e.fila, sinRelleno && e.sinRelleno, pressed && e.presionada]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[e.tarjeta, enFila && e.fila, sinRelleno && e.sinRelleno]}>{children}</View>;
}
