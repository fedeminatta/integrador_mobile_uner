import { ReactNode } from 'react';
import { View } from 'react-native';

import { estilos } from '@/componentes/Boton/GrupoBotones.estilos';

// Los botones van siempre uno arriba del otro, a ancho completo.
export function GrupoBotones({ children }: { children: ReactNode }) {
  return <View style={estilos.grupo}>{children}</View>;
}
