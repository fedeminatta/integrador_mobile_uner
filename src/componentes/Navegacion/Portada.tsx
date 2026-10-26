import { router, useNavigation } from 'expo-router';
import { DrawerActions } from 'expo-router/react-navigation';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icono } from '@/componentes/Icono/Icono';
import { Logo } from '@/componentes/Logo/Logo';
import { crearEstilos } from '@/componentes/Navegacion/Portada.estilos';
import { rutaAjustes } from '@/componentes/Navegacion/rutas';
import { useHaptica } from '@/hooks/useHaptica';
import { useEstilos } from '@/tema';

// Reemplaza al encabezado en el login: logo grande centrado, menú a la izquierda y ajustes a la derecha.
export function Portada() {
  const e = useEstilos(crearEstilos);
  const haptica = useHaptica();
  const navigation = useNavigation();

  const abrirMenu = () => {
    haptica.toque();
    navigation.dispatch(DrawerActions.openDrawer());
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
            style={({ pressed }) => [e.botonIcono, pressed && e.presionado]}>
            <Icono nombre="menu" tamano={24} color="sobreEncabezado" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir ajustes"
            onPress={abrirAjustes}
            style={({ pressed }) => [e.botonIcono, pressed && e.presionado]}>
            <Icono nombre="settings-outline" tamano={24} color="sobreEncabezado" />
          </Pressable>
        </View>
        <View style={e.marca}>
          <Logo tamano="portada" conPalabra apilado sobre="amarillo" />
          <Text style={e.leyenda}>GESTIÓN DE TRANSPORTE</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
