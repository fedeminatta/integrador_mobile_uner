import { router, usePathname } from 'expo-router';
import { DrawerHeaderProps } from 'expo-router/drawer';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icono } from '@/componentes/Icono/Icono';
import { Logo } from '@/componentes/Logo/Logo';
import { crearEstilos } from '@/componentes/Navegacion/Encabezado.estilos';
import { rutaAjustes, tituloDeRuta } from '@/componentes/Navegacion/rutas';
import { Texto } from '@/componentes/Texto/Texto';
import { useHaptica } from '@/hooks/useHaptica';
import { useEstilos } from '@/tema';

// Logo a la izquierda (abre el menú lateral) y ajustes a la derecha.
export function Encabezado({ navigation }: DrawerHeaderProps) {
  const e = useEstilos(crearEstilos);
  const haptica = useHaptica();
  const pathname = usePathname();

  const abrirMenu = () => {
    haptica.toque();
    navigation.openDrawer();
  };

  const abrirAjustes = () => {
    haptica.toque();
    router.push(rutaAjustes.href);
  };

  return (
    <SafeAreaView edges={['top']} style={e.panel}>
      <View style={e.interior}>
        <View style={e.fila}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir menú"
            onPress={abrirMenu}
            hitSlop={6}
            style={({ pressed }) => [e.botonLogo, pressed && e.presionado]}>
            <Logo tamano="mediano" conPalabra sobre="amarillo" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir ajustes"
            onPress={abrirAjustes}
            style={({ pressed }) => [e.botonIcono, pressed && e.presionado]}>
            <Icono nombre="settings-outline" tamano={24} color="sobreEncabezado" />
          </Pressable>
        </View>
        <Texto variante="titulo" tono="encabezado" accessibilityRole="header">
          {tituloDeRuta(pathname)}
        </Texto>
      </View>
    </SafeAreaView>
  );
}
