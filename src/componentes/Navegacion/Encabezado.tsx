import { router, usePathname } from 'expo-router';
import { DrawerHeaderProps } from 'expo-router/drawer';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icono } from '@/componentes/Icono/Icono';
import { Logo } from '@/componentes/Logo/Logo';
import { crearEstilos } from '@/componentes/Navegacion/Encabezado.estilos';
import { rutaAjustes, tituloDeRuta, rutaEscanear } from '@/componentes/Navegacion/rutas';
import { Texto } from '@/componentes/Texto/Texto';
import { useHaptica } from '@/hooks/useHaptica';
import { useEstilos } from '@/tema';

// Monograma (abre el menú lateral) y título de la pantalla a la izquierda; QR y ajustes a la derecha.
export function Encabezado({ navigation }: DrawerHeaderProps) {
  const e = useEstilos(crearEstilos);
  const haptica = useHaptica();
  const pathname = usePathname();

   const abrirMenu = () => {
    haptica.toque();
    navigation.openDrawer();
  };

  const abrirEscaner = () => {
    haptica.toque();
    router.push(rutaEscanear.href);
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
            style={({ pressed }) => [e.botonLogo, pressed && e.presionado]}>
            <Logo tamano="chico" />
          </Pressable>
          <Texto variante="titulo" tono="encabezado" accessibilityRole="header" numberOfLines={1} style={e.titulo}>
            {tituloDeRuta(pathname)}
          </Texto>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Escanear QR de parada"
            onPress={abrirEscaner}
            style={({ pressed }) => [e.botonIcono, pressed && e.presionado]}>
            <Icono nombre="qr-code-outline" tamano={24} color="sobreEncabezado" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir ajustes"
            onPress={abrirAjustes}
            style={({ pressed }) => [e.botonIcono, pressed && e.presionado]}>
            <Icono nombre="settings-outline" tamano={24} color="sobreEncabezado" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
