import { Text, View } from 'react-native';

import { crearEstilos } from '@/componentes/InsigniaLinea/InsigniaLinea.estilos';
import { useEstilos } from '@/tema';

export function InsigniaLinea({ numero, chica }: { numero: string; chica?: boolean }) {
  const e = useEstilos(crearEstilos);
  return (
    <View style={[e.insignia, chica && e.chica]} accessibilityLabel={`Línea ${numero}`}>
      <Text style={[e.numero, chica && e.numeroChico]}>{numero}</Text>
    </View>
  );
}
