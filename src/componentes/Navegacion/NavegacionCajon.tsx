import { Drawer } from 'expo-router/drawer';

import { Encabezado } from '@/componentes/Navegacion/Encabezado';
import { MenuLateral } from '@/componentes/Navegacion/MenuLateral';
import { crearEstilos } from '@/componentes/Navegacion/MenuLateral.estilos';
import { rutaAjustes, rutasCuenta } from '@/componentes/Navegacion/rutas';
import { useEstilos, useTema } from '@/tema';

// Menú lateral (izquierda) que contiene las tabs principales y las pantallas de cuenta.
export function NavegacionCajon() {
  const e = useEstilos(crearEstilos);
  const { colores } = useTema();
  return (
    <Drawer
      drawerContent={(props) => <MenuLateral {...props} />}
      // Volver desde un detalle regresa a la pantalla anterior, no siempre al inicio.
      backBehavior="history"
      screenOptions={{
        header: (props) => <Encabezado {...props} />,
        drawerPosition: 'left',
        drawerType: 'front',
        drawerStyle: e.cajon,
        overlayColor: colores.velo,
      }}>
      <Drawer.Screen name="(tabs)" />
      {/* Los detalles traen su propio encabezado con la flecha para volver. */}
      <Drawer.Screen name="(detalle)" options={{ headerShown: false, swipeEnabled: false }} />
      {[...rutasCuenta, rutaAjustes].map((r) => (
        // El login tiene su propio panel con el logo grande (Portada) en lugar del encabezado.
        <Drawer.Screen key={r.nombre} name={r.nombre} options={{ title: r.titulo, headerShown: r.nombre !== 'login' }} />
      ))}
    </Drawer>
  );
}
