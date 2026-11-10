import { useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';

import { aPunto, CENTRO_PARANA, MapaBase, REGION_PARANA } from '@/componentes/Mapa/Mapa';
import type { Coordenadas, Parada } from '@/tipos/types';
import { metrosEntre } from '@/utils/distancia';

// Encuadre de unas 10 cuadras alrededor del usuario.
const DELTA_CERCA = 0.015;
// Más lejos que esto, el usuario no está en Paraná: el mapa se queda mostrando la ciudad.
const RADIO_PARANA_M = 30_000;

type Props = {
  paradas: Parada[];
  /** Muestra el punto azul del usuario (solo con permiso concedido). */
  conUbicacion: boolean;
  /** Ubicación del usuario: si está en Paraná, el mapa se acerca hasta ahí. */
  centro?: Coordenadas | null;
  seleccionada: string | null;
  onSeleccionar: (id: string) => void;
  /** Al tocar el globo con el nombre de la parada. */
  onAbrir?: (id: string) => void;
  alto?: number;
};

export function MapaParadas({ paradas, conUbicacion, centro, seleccionada, onSeleccionar, onAbrir, alto }: Props) {
  const mapa = useRef<MapView>(null);

  useEffect(() => {
    if (!centro || metrosEntre(centro, CENTRO_PARANA) > RADIO_PARANA_M) return;
    mapa.current?.animateToRegion(
      { latitude: centro.latitud, longitude: centro.longitud, latitudeDelta: DELTA_CERCA, longitudeDelta: DELTA_CERCA },
      600,
    );
  }, [centro]);

  return (
    <MapaBase ref={mapa} region={REGION_PARANA} alto={alto} conUbicacion={conUbicacion} etiqueta="Mapa de paradas">
      {paradas.map((p) => (
        <Marker
          key={p.id}
          coordinate={aPunto(p.coordenadas)}
          title={p.nombre}
          description={onAbrir ? 'Toca para ver los horarios' : undefined}
          onPress={() => onSeleccionar(p.id)}
          onCalloutPress={() => onAbrir?.(p.id)}
          pinColor={seleccionada === p.id ? '#D9534F' : undefined}
        />
      ))}
    </MapaBase>
  );
}
