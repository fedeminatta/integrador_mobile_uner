import {
	CapaParadas,
	CENTRO_PARANA,
	MapaBase,
	REGION_PARANA,
} from '@/componentes/Mapa/Mapa';
import type { Coordenadas, Parada } from '@/tipos/types';
import { metrosEntre } from '@/utils/distancia';

// Zoom de unas 10 cuadras alrededor del usuario.
const ZOOM_CERCA = 14;
// Más lejos que esto, el usuario no está en Paraná: el mapa se queda mostrando la ciudad.
const RADIO_PARANA_M = 30_000;
const COLOR_PARADA = '#1B6CA8';

type Props = {
	paradas: Parada[];
	/** Muestra el punto del usuario (solo con permiso concedido). */
	conUbicacion: boolean;
	/** Ubicación del usuario: si está en Paraná, el mapa se acerca hasta ahí. */
	centro?: Coordenadas | null;
	seleccionada: string | null;
	onSeleccionar: (id: string) => void;
	/** Al tocar de nuevo la parada que ya estaba seleccionada, se abre su detalle. */
	onAbrir?: (id: string) => void;
	alto?: number;
};

export function MapaParadas({
	paradas,
	conUbicacion,
	centro,
	seleccionada,
	onSeleccionar,
	onAbrir,
	alto,
}: Props) {
	const enParana =
		!!centro && metrosEntre(centro, CENTRO_PARANA) <= RADIO_PARANA_M;

	const alTocar = (id: string) => {
		if (id === seleccionada && onAbrir) onAbrir(id);
		else onSeleccionar(id);
	};

	return (
		<MapaBase
			region={REGION_PARANA}
			alto={alto}
			conUbicacion={conUbicacion}
			etiqueta='Mapa de paradas'
			enfocar={enParana && centro ? { centro, zoom: ZOOM_CERCA } : null}
		>
			<CapaParadas
				idBase='paradas'
				paradas={paradas}
				color={COLOR_PARADA}
				seleccionada={seleccionada}
				onPress={alTocar}
			/>
		</MapaBase>
	);
}
