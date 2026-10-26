import { useEffect, useState } from 'react';
import { Animated, Easing, View } from 'react-native';

import { crearEstilos } from '@/componentes/Cargando/Cargando.estilos';
import { Logo } from '@/componentes/Logo/Logo';
import { Texto } from '@/componentes/Texto/Texto';
import { useEstilos } from '@/tema';

type Props = {
  texto?: string;
  centrado?: boolean;
};

// Spinner de marca: la "P" de Paran con un anillo amarillo que gira.
export function Cargando({ texto, centrado }: Props) {
  const e = useEstilos(crearEstilos);
  const [giro] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const bucle = Animated.loop(
      Animated.timing(giro, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true }),
    );
    bucle.start();
    return () => bucle.stop();
  }, [giro]);

  const rotacion = { transform: [{ rotate: giro.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] };

  return (
    <View style={[e.fila, centrado && e.centro]} accessibilityRole="progressbar" accessibilityLabel={texto ?? 'Cargando'}>
      <View style={e.marco}>
        <Animated.View style={[e.anillo, rotacion]} />
        <Logo tamano="chico" />
      </View>
      {!!texto && <Texto tono="suave">{texto}</Texto>}
    </View>
  );
}
