import { useNetworkState } from 'expo-network';
import { useEffect, useRef, useState } from 'react';

import { leerPreferencia } from '@/db/preferencias';
import { CLAVE_ULTIMA_ACTUALIZACION } from '@/servicios/red';
import {
	sincronizarCatalogo,
	sincronizarReportesPendientes,
} from '@/servicios/sincronizacion';

// Estado de la red (expo-network) y hora de los últimos datos que llegaron de la API.
export function useRed() {
	const estado = useNetworkState();
	// Mientras no se sabe (undefined) se asume que hay conexión, para no mostrar el aviso de más.
	const sinConexion =
		estado.isConnected === false || estado.isInternetReachable === false;
	const [ultimaActualizacion, setUltima] = useState<string | null>(null);
	const estabaSinConexion = useRef(sinConexion);

	useEffect(() => {
		if (sinConexion)
			leerPreferencia(CLAVE_ULTIMA_ACTUALIZACION).then(setUltima);
	}, [sinConexion]);

	useEffect(() => {
		// Volvió la conexión: reenviar lo pendiente y refrescar el catálogo guardado.
		if (estabaSinConexion.current && !sinConexion) {
			sincronizarReportesPendientes().catch(() => {});
			sincronizarCatalogo().catch(() => {});
		}
		estabaSinConexion.current = sinConexion;
	}, [sinConexion]);

	return { sinConexion, ultimaActualizacion };
}
