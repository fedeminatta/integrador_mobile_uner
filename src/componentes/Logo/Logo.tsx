import { Image } from 'expo-image';
import { View } from 'react-native';

import { estilos } from '@/componentes/Logo/Logo.estilos';
import { useTema } from '@/tema';

const imagenes = {
  marca: {
    color: require('@/assets/images/paran/marca-color.png'),
    blanco: require('@/assets/images/paran/marca-blanco.png'),
    azul: require('@/assets/images/paran/marca-azul.png'),
  },
  palabra: {
    color: require('@/assets/images/paran/palabra-color.png'),
    blanco: require('@/assets/images/paran/palabra-blanco.png'),
    azul: require('@/assets/images/paran/palabra-azul.png'),
  },
};

export type TamanoLogo = 'chico' | 'mediano' | 'grande' | 'portada';

type Props = {
  tamano?: TamanoLogo;
  conPalabra?: boolean;
  // Marca arriba y palabra abajo en vez de una al lado de la otra.
  apilado?: boolean;
  // 'amarillo': el logo va sobre fondo amarillo (todo azul). 'auto': según el tema
  // (a color en el claro; blanco y amarillo en el oscuro).
  sobre?: 'auto' | 'amarillo';
};

const sufijo = { chico: 'Chico', mediano: 'Mediano', grande: 'Grande', portada: 'Portada' } as const;

export function Logo({ tamano = 'mediano', conPalabra = false, apilado = false, sobre = 'auto' }: Props) {
  const { esOscuro } = useTema();
  const tono = sobre === 'amarillo' ? 'azul' : esOscuro ? 'blanco' : 'color';
  return (
    <View style={apilado ? estilos.columna : estilos.fila} accessibilityLabel="Paran" accessibilityRole="image" accessible>
      <Image source={imagenes.marca[tono]} style={estilos[`marca${sufijo[tamano]}`]} contentFit="contain" />
      {conPalabra && <Image source={imagenes.palabra[tono]} style={estilos[`palabra${sufijo[tamano]}`]} contentFit="contain" />}
    </View>
  );
}
