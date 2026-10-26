import { View } from 'react-native';

import { crearEstilos } from '@/componentes/Separador/Separador.estilos';
import { Texto } from '@/componentes/Texto/Texto';
import { useEstilos } from '@/tema';

// Línea horizontal con un texto corto al medio, por ejemplo "o" entre dos botones.
export function Separador({ texto }: { texto?: string }) {
  const e = useEstilos(crearEstilos);
  return (
    <View style={e.fila}>
      <View style={e.linea} />
      {!!texto && <Texto variante="chico">{texto}</Texto>}
      <View style={e.linea} />
    </View>
  );
}
