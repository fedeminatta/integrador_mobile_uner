import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';

import { Boton } from '@/componentes/Boton/Boton';
import { GrupoBotones } from '@/componentes/Boton/GrupoBotones';
import { crearEstilos } from '@/componentes/Desbloqueo/Desbloqueo.estilos';
import { Logo } from '@/componentes/Logo/Logo';
import { Notificacion } from '@/componentes/Notificacion/Notificacion';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { Texto } from '@/componentes/Texto/Texto';
import { useHaptica } from '@/hooks/useHaptica';
import { useSesion } from '@/hooks/useSesion';
import { useEstilos } from '@/tema';

/**
 * Tapa toda la app cuando la sesión está bloqueada (token + biometría).
 * mientras `bloqueado` sea true, así no se puede entrar por atrás.
 */
export function Desbloqueo() {
  const { desbloquear, salir } = useSesion();
  const haptica = useHaptica();
  const e = useEstilos(crearEstilos);
  const [mensaje, setMensaje] = useState<string | null>(null);
  // Arranca en true: el effect pide el desbloqueo apenas monta.
  const [intentando, setIntentando] = useState(true);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const error = await desbloquear();
      if (!vivo) return;
      setIntentando(false);
      if (error) {
        setMensaje(error.mensaje);
        haptica.error();
      } else {
        haptica.exito();
      }
    })();
    return () => {
      vivo = false;
    };
  }, [desbloquear, haptica]);

  // Reintento manual: en un handler sí podemos marcar carga de forma síncrona.
  const reintentar = useCallback(async () => {
    setIntentando(true);
    setMensaje(null);
    const error = await desbloquear();
    setIntentando(false);
    if (error) {
      setMensaje(error.mensaje);
      haptica.error();
    } else {
      haptica.exito();
    }
  }, [desbloquear, haptica]);

  const cerrarSesion = useCallback(() => {
    salir().catch(() => {});
  }, [salir]);

  return (
    <Pantalla>
      <View style={e.marca}>
        <Logo tamano="grande" conPalabra apilado />
      </View>
      <Seccion
        titulo="Sesión bloqueada"
        descripcion="Desbloqueá tu sesión para continuar."
      >
        {!!mensaje && (
          <Notificacion tipo="error" titulo="No pudimos desbloquear" mensaje={mensaje} />
        )}
        <Texto variante="chico" centrado>
          Usá la huella o el rostro de tu teléfono. Si no podés, cerrá sesión y volvé a ingresar.
        </Texto>
        <GrupoBotones>
          <Boton
            texto="Intentar de nuevo"
            icono="finger-print-outline"
            cargando={intentando}
            onPress={reintentar}
          />
          <Boton
            texto="Cerrar sesión"
            variante="peligro"
            icono="log-out-outline"
            deshabilitado={intentando}
            onPress={cerrarSesion}
          />
        </GrupoBotones>
      </Seccion>
    </Pantalla>
  );
}