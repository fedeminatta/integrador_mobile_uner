import { Pressable, Switch, View } from 'react-native';

import { crearEstilos } from '@/componentes/Filas/Filas.estilos';
import { Icono, NombreIcono } from '@/componentes/Icono/Icono';
import { Texto } from '@/componentes/Texto/Texto';
import { useHaptica } from '@/hooks/useHaptica';
import { useEstilos, useTema } from '@/tema';

type Base = {
  titulo: string;
  descripcion?: string;
  icono?: NombreIcono;
  conDivisor?: boolean;
};

// Opción de una lista de elección única (se usan dentro de una Tarjeta sin relleno).
export function FilaOpcion({ titulo, descripcion, icono, conDivisor, activa, onElegir }: Base & { activa: boolean; onElegir: () => void }) {
  const e = useEstilos(crearEstilos);
  const haptica = useHaptica();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: activa }}
      onPress={() => {
        haptica.toque();
        onElegir();
      }}
      style={({ pressed }) => [e.fila, conDivisor && e.divisor, pressed && e.presionada]}>
      {icono && <Icono nombre={icono} tamano={22} color="enlace" />}
      <View style={e.textos}>
        <Texto variante="destacado">{titulo}</Texto>
        {!!descripcion && <Texto variante="chico">{descripcion}</Texto>}
      </View>
      <View style={[e.radio, activa && e.radioActivo]}>{activa && <View style={e.punto} />}</View>
    </Pressable>
  );
}

export function FilaInterruptor({ titulo, descripcion, icono, conDivisor, valor, onCambiar }: Base & { valor: boolean; onCambiar: (v: boolean) => void }) {
  const e = useEstilos(crearEstilos);
  const { colores } = useTema();
  return (
    <View style={[e.fila, conDivisor && e.divisor]}>
      {icono && <Icono nombre={icono} tamano={22} color="enlace" />}
      <View style={e.textos}>
        <Texto variante="destacado">{titulo}</Texto>
        {!!descripcion && <Texto variante="chico">{descripcion}</Texto>}
      </View>
      <Switch
        accessibilityLabel={titulo}
        value={valor}
        onValueChange={onCambiar}
        trackColor={{ false: colores.borde, true: colores.insignia }}
        thumbColor={valor ? colores.primario : colores.superficie}
      />
    </View>
  );
}
