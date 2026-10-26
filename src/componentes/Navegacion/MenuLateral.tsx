import { router, usePathname } from 'expo-router';
import { DrawerContentComponentProps, DrawerContentScrollView } from 'expo-router/drawer';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cargando } from '@/componentes/Cargando/Cargando';
import { Icono, NombreIcono } from '@/componentes/Icono/Icono';
import { Logo } from '@/componentes/Logo/Logo';
import { crearEstilos } from '@/componentes/Navegacion/MenuLateral.estilos';
import { Ruta, rutaAjustes, rutasCuenta, rutasPrincipales } from '@/componentes/Navegacion/rutas';
import { Texto } from '@/componentes/Texto/Texto';
import { useHaptica } from '@/hooks/useHaptica';
import { useSesion } from '@/hooks/useSesion';
import { useEstilos } from '@/tema';

type PropsItem = {
  titulo: string;
  icono: NombreIcono;
  activo?: boolean;
  onPress: () => void;
};

function ItemMenu({ titulo, icono, activo, onPress }: PropsItem) {
  const e = useEstilos(crearEstilos);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={onPress}
      style={({ pressed }) => [e.item, pressed && e.itemPresionado, activo && e.itemActivo]}>
      <Icono nombre={icono} tamano={22} color={activo ? 'sobreInsignia' : 'enlace'} />
      <Text style={[e.textoItem, activo && e.textoItemActivo]}>{titulo}</Text>
    </Pressable>
  );
}

export function MenuLateral({ navigation }: DrawerContentComponentProps) {
  const e = useEstilos(crearEstilos);
  const pathname = usePathname();
  const haptica = useHaptica();
  const { usuario, verificando, salir } = useSesion();

  const ir = (ruta: Ruta) => {
    haptica.toque();
    navigation.closeDrawer();
    router.navigate(ruta.href);
  };

  const cerrarSesion = async () => {
    haptica.toque();
    await salir();
    navigation.closeDrawer();
    router.navigate('/');
  };

  const item = (ruta: Ruta) => (
    <ItemMenu
      key={ruta.nombre}
      titulo={ruta.titulo}
      icono={pathname === ruta.ruta ? ruta.iconoActivo : ruta.icono}
      activo={pathname === ruta.ruta}
      onPress={() => ir(ruta)}
    />
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={e.contenedor}>
      <DrawerContentScrollView contentContainerStyle={e.desplazable}>
        <View style={e.cabecera}>
          <Logo tamano="grande" conPalabra />
          <Texto variante="etiqueta">Gestión de transporte</Texto>
          {verificando ? (
            <Cargando texto="Verificando sesión" />
          ) : (
            usuario && (
              <View style={e.usuario}>
                <Texto variante="destacado">{usuario.nombre}</Texto>
                <Texto variante="chico">{usuario.correo}</Texto>
              </View>
            )
          )}
        </View>

        <View style={e.grupo}>
          <View style={e.tituloGrupo}>
            <Texto variante="etiqueta">Navegar</Texto>
          </View>
          {rutasPrincipales.map(item)}
        </View>

        <View style={e.grupo}>
          <View style={e.tituloGrupo}>
            <Texto variante="etiqueta">Cuenta</Texto>
          </View>
          {usuario ? <ItemMenu titulo="Cerrar sesión" icono="log-out-outline" onPress={cerrarSesion} /> : rutasCuenta.map(item)}
          {item(rutaAjustes)}
        </View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
}
