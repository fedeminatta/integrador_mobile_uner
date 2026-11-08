import { ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { estilos } from '@/componentes/Navegacion/RaizApp.estilos';
import { ProveedorPreferencias } from '@/hooks/usePreferencias';
import { ProveedorSesion, useSesion } from '@/hooks/useSesion';
import { useTema } from '@/tema';
import { temaDeNavegacion } from '@/tema/navegacion';
import { Desbloqueo } from '@/componentes/Desbloqueo/Desbloqueo';

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

/** Muestra la app; mientras la sesión esta bloqueada */
function Contenido({ children }: { children: ReactNode }) {
  const { bloqueado } = useSesion();
  if (bloqueado) return <Desbloqueo />;
  return <>{children}</>;
}

export function RaizApp({ children }: { children: ReactNode }) {
  return (
     <GestureHandlerRootView style={estilos.raiz}>
      <ProveedorPreferencias>
        <ProveedorSesion>
          <TemaNavegacion>
            <Contenido>{children}</Contenido>
          </TemaNavegacion>
        </ProveedorSesion>
      </ProveedorPreferencias>
    </GestureHandlerRootView>
  );
}
