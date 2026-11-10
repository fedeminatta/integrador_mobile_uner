import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

// Provincia y localidad donde está el usuario ("Entre Ríos - Paraná"), a partir del GPS.
// Sin permiso de ubicación devuelve null y la app sigue funcionando igual.
export function useLugar() {
  const [permiso, pedirPermiso] = Location.useForegroundPermissions();
  const [lugar, setLugar] = useState<string | null>(null);
  const concedido = !!permiso?.granted;

  useEffect(() => {
    if (!concedido) return;
    let vivo = true;
    (async () => {
      try {
        const posicion =
          (await Location.getLastKnownPositionAsync()) ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
        const [direccion] = await Location.reverseGeocodeAsync(posicion.coords);
        if (!vivo || !direccion) return;
        const partes = [direccion.region, direccion.city ?? direccion.subregion].filter((p): p is string => !!p);
        setLugar(partes.length ? partes.join(' - ') : null);
      } catch {
        // GPS apagado o sin servicio de direcciones: no se muestra el lugar.
      }
    })();
    return () => {
      vivo = false;
    };
  }, [concedido]);

  return {
    lugar,
    concedido,
    // Si el sistema ya no deja preguntar, no tiene sentido mostrar el botón.
    puedePedir: !permiso || permiso.canAskAgain,
    pedirPermiso,
  };
}
