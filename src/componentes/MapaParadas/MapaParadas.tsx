import { useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';

import { crearEstilos } from '@/componentes/MapaParadas/MapaParadas.estilos';
import { useEstilos } from '@/tema';
import type { ParadaVista } from '@/servicios/paradasApi';
import type { Coordenadas } from '@/tipos/types';

// Centro de Paraná con las 73 paradas adentro del encuadre inicial.
const REGION_PARANA = {
  latitude: -31.73,
  longitude: -60.53,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

// Encuadre de unas 10 cuadras alrededor del usuario.
const DELTA_CERCA = 0.015;

type Props = {
  paradas: ParadaVista[];
  /** Muestra el punto azul del usuario (solo con permiso concedido). */
  conUbicacion: boolean;
  /** Cuando se conoce la ubicación del usuario, el mapa se mueve hasta ahí. */
  centro?: Coordenadas | null;
  seleccionada: string | null;
  onSeleccionar: (id: string) => void;
};

export function MapaParadas({ paradas, conUbicacion, centro, seleccionada, onSeleccionar }: Props) {
  const e = useEstilos(crearEstilos);
  const mapa = useRef<MapView>(null);

  useEffect(() => {
    if (!centro) return;
    mapa.current?.animateToRegion(
      { latitude: centro.latitud, longitude: centro.longitud, latitudeDelta: DELTA_CERCA, longitudeDelta: DELTA_CERCA },
      600,
    );
  }, [centro]);

  return (
    <MapView
      ref={mapa}
      style={e.mapa}
      initialRegion={REGION_PARANA}
      showsUserLocation={conUbicacion}
      showsMyLocationButton={conUbicacion}
      accessibilityLabel="Mapa de paradas">
      {paradas.map((p) => (
        <Marker
          key={p.id}
          coordinate={{ latitude: p.coordenadas.latitud, longitude: p.coordenadas.longitud }}
          title={p.nombre}
          onPress={() => onSeleccionar(p.id)}
          pinColor={seleccionada === p.id ? '#D9534F' : undefined}
        />
      ))}
    </MapView>
  );
}
