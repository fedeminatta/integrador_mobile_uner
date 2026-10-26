import { useEffect, useState } from 'react';
import { Animated, View } from 'react-native';

import { crearEstilos } from '@/componentes/Esqueleto/Esqueleto.estilos';
import { useEstilos } from '@/tema';

type FormaBloque = 'linea' | 'lineaCorta' | 'lineaTitulo' | 'insignia' | 'hora' | 'circulo' | 'campo';

function usePulso() {
  const [valor] = useState(() => new Animated.Value(0.5));
  useEffect(() => {
    const bucle = Animated.loop(
      Animated.sequence([
        Animated.timing(valor, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(valor, { toValue: 0.5, duration: 650, useNativeDriver: true }),
      ]),
    );
    bucle.start();
    return () => bucle.stop();
  }, [valor]);
  return { opacity: valor };
}

export function Bloque({ forma }: { forma: FormaBloque }) {
  const e = useEstilos(crearEstilos);
  const pulso = usePulso();
  return <Animated.View style={[e.bloque, e[forma], pulso]} />;
}

export type VarianteEsqueleto = 'horario' | 'linea' | 'parada' | 'aviso' | 'notificacion' | 'acordeon' | 'formulario';

// Cada variante copia la forma del componente que reemplaza mientras carga.
export function Esqueleto({ variante }: { variante: VarianteEsqueleto }) {
  const e = useEstilos(crearEstilos);

  if (variante === 'notificacion') {
    return (
      <View style={e.notificacion}>
        <Bloque forma="circulo" />
        <View style={e.textos}>
          <Bloque forma="lineaTitulo" />
          <Bloque forma="linea" />
        </View>
      </View>
    );
  }

  if (variante === 'acordeon') {
    return (
      <View style={e.acordeon}>
        {[0, 1].map((i) => (
          <View key={i} style={[e.filaAcordeon, i > 0 && e.divisor]}>
            <Bloque forma="lineaTitulo" />
          </View>
        ))}
      </View>
    );
  }

  if (variante === 'aviso' || variante === 'formulario') {
    return (
      <View style={[e.tarjeta, e.tarjetaColumna]}>
        <Bloque forma="lineaTitulo" />
        <Bloque forma="linea" />
        {variante === 'formulario' ? <Bloque forma="campo" /> : <Bloque forma="lineaCorta" />}
      </View>
    );
  }

  return (
    <View style={e.tarjeta}>
      <Bloque forma="insignia" />
      <View style={e.textos}>
        <Bloque forma="lineaTitulo" />
        {variante === 'parada' ? (
          <View style={e.fila}>
            <Bloque forma="circulo" />
            <Bloque forma="circulo" />
          </View>
        ) : (
          <Bloque forma="lineaCorta" />
        )}
      </View>
      {variante === 'horario' && <Bloque forma="hora" />}
    </View>
  );
}

export function EsqueletoLista({ variante, cantidad = 3 }: { variante: VarianteEsqueleto; cantidad?: number }) {
  const e = useEstilos(crearEstilos);
  return (
    <View style={e.lista} accessibilityLabel="Cargando" accessibilityRole="progressbar">
      {Array.from({ length: cantidad }, (_, i) => (
        <Esqueleto key={i} variante={variante} />
      ))}
    </View>
  );
}
