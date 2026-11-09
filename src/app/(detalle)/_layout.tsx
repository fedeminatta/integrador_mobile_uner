import { Stack } from 'expo-router';

import { EncabezadoDetalle } from '@/componentes/Navegacion/EncabezadoDetalle';

// Pantallas de detalle (línea, parada, aviso, reportar...): se apilan y se vuelve con la flecha.
export default function LayoutDetalle() {
  return <Stack screenOptions={{ header: (props) => <EncabezadoDetalle {...props} /> }} />;
}
