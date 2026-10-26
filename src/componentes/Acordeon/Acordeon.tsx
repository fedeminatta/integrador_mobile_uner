import { Children, isValidElement, ReactNode, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { crearEstilos } from '@/componentes/Acordeon/Acordeon.estilos';
import { Icono, NombreIcono } from '@/componentes/Icono/Icono';
import { useHaptica } from '@/hooks/useHaptica';
import { useEstilos } from '@/tema';

export function Acordeon({ children }: { children: ReactNode }) {
  const e = useEstilos(crearEstilos);
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <View style={e.grupo}>
      {items.map((item, i) => (
        <View key={item.key ?? i} style={i > 0 && e.divisor}>
          {item}
        </View>
      ))}
    </View>
  );
}

type PropsItem = {
  titulo: string;
  icono?: NombreIcono;
  abiertoAlInicio?: boolean;
  children: ReactNode;
};

export function ItemAcordeon({ titulo, icono, abiertoAlInicio = false, children }: PropsItem) {
  const e = useEstilos(crearEstilos);
  const haptica = useHaptica();
  const [abierto, setAbierto] = useState(abiertoAlInicio);

  const alternar = () => {
    haptica.toque();
    setAbierto((a) => !a);
  };

  return (
    <View style={[e.item, abierto && e.abierto]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: abierto }}
        onPress={alternar}
        style={({ pressed }) => [e.cabecera, pressed && e.cabeceraPresionada]}>
        {icono && <Icono nombre={icono} tamano={20} color="enlace" />}
        <Text style={e.titulo}>{titulo}</Text>
        <Icono nombre={abierto ? 'chevron-up' : 'chevron-down'} tamano={20} color="textoSuave" />
      </Pressable>
      {abierto && <View style={e.cuerpo}>{children}</View>}
    </View>
  );
}
