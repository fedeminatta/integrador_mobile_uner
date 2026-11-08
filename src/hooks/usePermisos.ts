import { PermissionStatus, type PermissionResponse } from 'expo';
import { useCameraPermissions } from 'expo-camera';
import { useForegroundPermissions } from 'expo-location';
import { useCallback, useMemo } from 'react';
import { Linking } from 'react-native';

export type Permiso = 'camara' | 'ubicacion';

export type EstadoPermiso = 'sin-determinar' | 'concedido' | 'denegado' | 'bloqueado';

function estadoDe(respuesta: PermissionResponse | null): EstadoPermiso {
  if (!respuesta) return 'sin-determinar';
  if (respuesta.granted) return 'concedido';
  if (respuesta.status === PermissionStatus.UNDETERMINED) return 'sin-determinar';
  return respuesta.canAskAgain ? 'denegado' : 'bloqueado';
}

/**
 * Estado de los permisos de cámara y ubicación.
 */
export function usePermisos() {
  const [camara, pedirCamara] = useCameraPermissions();
  const [ubicacion, pedirUbicacion] = useForegroundPermissions();

  const pedir = useCallback(async (permiso: Permiso): Promise<EstadoPermiso> => {
    if (permiso === 'camara') return estadoDe(await pedirCamara());
    return estadoDe(await pedirUbicacion());
  }, [pedirCamara, pedirUbicacion]);

  /** Cuando quedo en 'bloqueado', el sistema ya no deja preguntar: hay que abrir Ajustes. */
  const abrirAjustes = useCallback(() => {
    Linking.openSettings().catch(() => {});
  }, []);

  const estados = useMemo(
    () => ({
      camara: estadoDe(camara),
      ubicacion: estadoDe(ubicacion),
    }),
    [camara, ubicacion],
  );

  return { estados, pedir, abrirAjustes };
}