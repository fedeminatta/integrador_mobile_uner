import { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icono } from '@/componentes/Icono/Icono';
import { crearEstilos } from '@/componentes/Navegacion/BarraTabs.estilos';
import { rutasPrincipales } from '@/componentes/Navegacion/rutas';
import { useHaptica } from '@/hooks/useHaptica';
import { useEstilos } from '@/tema';

// Barra de tabs flotante para las páginas principales.
export function BarraTabs({ state, navigation }: BottomTabBarProps) {
  const e = useEstilos(crearEstilos);
  const haptica = useHaptica();

  return (
    <View style={e.capa} pointerEvents="box-none">
      <SafeAreaView edges={['bottom']} style={e.zona} pointerEvents="box-none">
        <View style={e.barra} accessibilityRole="tablist">
          {state.routes.map((route, i) => {
            const ruta = rutasPrincipales.find((r) => r.nombre === route.name);
            if (!ruta) return null;
            const activa = state.index === i;

            const presionar = () => {
              const evento = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!activa && !evento.defaultPrevented) {
                haptica.toque();
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: activa }}
                accessibilityLabel={ruta.titulo}
                onPress={presionar}
                style={({ pressed }) => [e.tab, activa && e.tabActiva, pressed && e.tabPresionada]}>
                <Icono nombre={activa ? ruta.iconoActivo : ruta.icono} tamano={22} color={activa ? 'sobreTabActiva' : 'textoSuave'} />
                <Text style={[e.etiqueta, activa && e.etiquetaActiva]} numberOfLines={1}>
                  {ruta.titulo}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}
