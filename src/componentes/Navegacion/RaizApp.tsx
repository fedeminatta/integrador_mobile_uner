import { ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { estilos } from '@/componentes/Navegacion/RaizApp.estilos';
import { ProveedorPreferencias } from '@/hooks/usePreferencias';
import { ProveedorSesion } from '@/hooks/useSesion';
import { useTema } from '@/tema';
import { temaDeNavegacion } from '@/tema/navegacion';

function TemaNavegacion({ children }: { children: ReactNode }) {
  const tema = useTema();
  const temaNav = useMemo(() => temaDeNavegacion(tema), [tema]);
  return (
    <ThemeProvider value={temaNav}>
      {/* El encabezado es amarillo en ambos temas: iconos de estado oscuros. */}
      <StatusBar style="dark" />
      {children}
    </ThemeProvider>
  );
}

export function RaizApp({ children }: { children: ReactNode }) {
  return (
    <GestureHandlerRootView style={estilos.raiz}>
      <ProveedorPreferencias>
        <ProveedorSesion>
          <TemaNavegacion>{children}</TemaNavegacion>
        </ProveedorSesion>
      </ProveedorPreferencias>
    </GestureHandlerRootView>
  );
}
