import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import type { Coordenadas } from '@/tipos/types';

// Posición del usuario solo si ya dio permiso de ubicación (no lo pide: la app anda sin él).
export function useUbicacion(): Coordenadas | null {
  const [permiso] = Location.useForegroundPermissions();
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);
  const concedido = !!permiso?.granted;

  useEffect(() => {
    if (!concedido) return;
    let vivo = true;
    (async () => {
      try {
        const ultima = await Location.getLastKnownPositionAsync();
        if (vivo && ultima) setUbicacion({ latitud: ultima.coords.latitude, longitud: ultima.coords.longitude });
        const actual = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (vivo) setUbicacion({ latitud: actual.coords.latitude, longitud: actual.coords.longitude });
      } catch {
        // GPS apagado o sin señal: se sigue sin ubicación.
      }
    })();
    return () => {
      vivo = false;
    };
  }, [concedido]);

  return ubicacion;
}
