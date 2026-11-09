import MapView, { Marker } from 'react-native-maps';

import { crearEstilos } from '@/componentes/MapaParadas/MapaParadas.estilos';
import { useEstilos } from '@/tema';
import type { ParadaVista } from '@/servicios/paradasApi';

// Centro de Paraná con las 73 paradas adentro del encuadre inicial.
const REGION_PARANA = {
  latitude: -31.73,
  longitude: -60.53,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

type Props = {
  paradas: ParadaVista[];
  /** Muestra el punto azul del usuario (solo con permiso concedido). */
  conUbicacion: boolean;
  seleccionada: string | null;
  onSeleccionar: (id: string) => void;
};

export function MapaParadas({ paradas, conUbicacion, seleccionada, onSeleccionar }: Props) {
  const e = useEstilos(crearEstilos);
  return (
    <MapView
      style={e.mapa}
      initialRegion={REGION_PARANA}
      showsUserLocation={conUbicacion}
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