import { NativeStackHeaderProps, router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icono } from '@/componentes/Icono/Icono';
import { crearEstilos } from '@/componentes/Navegacion/Encabezado.estilos';
import { Texto } from '@/componentes/Texto/Texto';
import { useHaptica } from '@/hooks/useHaptica';
import { useEstilos } from '@/tema';

// Encabezado de las pantallas de detalle: volver y título a la izquierda, acción opcional (favorito) a la derecha.
export function EncabezadoDetalle({ navigation, options, back }: NativeStackHeaderProps) {
  const e = useEstilos(crearEstilos);
  const haptica = useHaptica();

  const volver = () => {
    haptica.toque();
    if (back) navigation.goBack();
    else if (router.canGoBack()) router.back();
    else router.navigate('/');
  };

  return (
    <SafeAreaView edges={['top']} style={e.panel}>
      <View style={e.interior}>
        <View style={e.fila}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={volver}
            style={({ pressed }) => [e.botonIcono, pressed && e.presionado]}>
            <Icono nombre="arrow-back" tamano={24} color="sobreEncabezado" />
          </Pressable>
          <Texto variante="titulo" tono="encabezado" accessibilityRole="header" numberOfLines={1} style={e.titulo}>
            {options.title ?? 'Paran'}
          </Texto>
          {options.headerRight?.({ canGoBack: true })}
        </View>
      </View>
    </SafeAreaView>
  );
}
