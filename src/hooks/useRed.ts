import { useNetworkState } from 'expo-network';
import { useEffect, useState } from 'react';

import { leerPreferencia } from '@/db/preferencias';
import { CLAVE_ULTIMA_ACTUALIZACION } from '@/servicios/red';

// Estado de la red (expo-network) y hora de los últimos datos que llegaron de la API.
export function useRed() {
  const estado = useNetworkState();
  // Mientras no se sabe (undefined) se asume que hay conexión, para no mostrar el aviso de más.
  const sinConexion = estado.isConnected === false || estado.isInternetReachable === false;
  const [ultimaActualizacion, setUltima] = useState<string | null>(null);

  useEffect(() => {
    if (sinConexion) leerPreferencia(CLAVE_ULTIMA_ACTUALIZACION).then(setUltima);
  }, [sinConexion]);

  return { sinConexion, ultimaActualizacion };
}
