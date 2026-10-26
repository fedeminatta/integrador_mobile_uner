import Tabs from 'expo-router/js-tabs';

import { BarraTabs } from '@/componentes/Navegacion/BarraTabs';
import { rutasPrincipales } from '@/componentes/Navegacion/rutas';

export function NavegacionTabs() {
  return (
    <Tabs tabBar={(props) => <BarraTabs {...props} />} screenOptions={{ headerShown: false }}>
      {rutasPrincipales.map((r) => (
        <Tabs.Screen key={r.nombre} name={r.nombre} options={{ title: r.titulo }} />
      ))}
    </Tabs>
  );
}
