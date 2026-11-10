import { forwardRef, ReactNode } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';

import { Tema, useEstilos } from '@/tema';
import type { Coordenadas, Parada } from '@/tipos/types';

// Mapas de OpenStreetMap: no necesitan clave de Google y andan igual en Expo Go y en el APK.
const TEXTURAS_OSM = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const CENTRO_PARANA: Coordenadas = { latitud: -31.7333, longitud: -60.5241 };

export type Region = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };

export const REGION_PARANA: Region = {
  latitude: CENTRO_PARANA.latitud,
  longitude: CENTRO_PARANA.longitud,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

export const aPunto = (c: Coordenadas) => ({ latitude: c.latitud, longitude: c.longitud });

// Región que encuadra todos los puntos, con un margen alrededor.
export function regionDe(puntos: Coordenadas[]): Region {
  if (!puntos.length) return REGION_PARANA;
  const lats = puntos.map((p) => p.latitud);
  const lons = puntos.map((p) => p.longitud);
  const [minLat, maxLat, minLon, maxLon] = [Math.min(...lats), Math.max(...lats), Math.min(...lons), Math.max(...lons)];
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.01),
    longitudeDelta: Math.max((maxLon - minLon) * 1.5, 0.01),
  };
}

type PropsBase = {
  region: Region;
  alto?: number;
  conUbicacion?: boolean;
  etiqueta: string;
  children?: ReactNode;
};

// Mapa con las texturas de OpenStreetMap y su crédito. En Android se ocultan las de Google.
export const MapaBase = forwardRef<MapView, PropsBase>(function MapaBase({ region, alto = 220, conUbicacion = false, etiqueta, children }, ref) {
  const e = useEstilos(crearEstilos);
  return (
    // Sin borderRadius ni overflow: 'hidden': en Android recortar el mapa lo dibuja en negro.
    <View style={[e.marco, { height: alto }]}>
      <MapView
        ref={ref}
        style={e.mapa}
        initialRegion={region}
        mapType={Platform.OS === 'android' ? 'none' : 'standard'}
        showsUserLocation={conUbicacion}
        showsMyLocationButton={conUbicacion}
        accessibilityLabel={etiqueta}>
        <UrlTile urlTemplate={TEXTURAS_OSM} maximumZ={19} flipY={false} />
        {children}
      </MapView>
      <Text style={e.atribucion}>© OpenStreetMap</Text>
    </View>
  );
});

type PropsRecorrido = {
  // Trazado principal (el recorrido de la línea).
  trazado: Coordenadas[];
  color: string;
  // Trazado alternativo de un desvío, que se dibuja punteado encima.
  alternativo?: Coordenadas[] | null;
  colorAlternativo?: string;
  paradas?: Parada[];
  onParada?: (id: string) => void;
  etiqueta: string;
};

export function MapaRecorrido({ trazado, color, alternativo, colorAlternativo = '#D9534F', paradas = [], onParada, etiqueta }: PropsRecorrido) {
  const todos = [...trazado, ...(alternativo ?? []), ...paradas.map((p) => p.coordenadas)];
  return (
    // La key fuerza a encuadrar de nuevo cuando cambia el recorrido (por ejemplo, de ida a vuelta).
    <MapaBase key={todos.map((p) => `${p.latitud},${p.longitud}`).join('|')} region={regionDe(todos)} etiqueta={etiqueta}>
      {trazado.length > 1 && <Polyline coordinates={trazado.map(aPunto)} strokeColor={color} strokeWidth={5} />}
      {alternativo && alternativo.length > 1 && (
        <Polyline coordinates={alternativo.map(aPunto)} strokeColor={colorAlternativo} strokeWidth={5} lineDashPattern={[12, 8]} />
      )}
      {paradas.map((p) => (
        <Marker key={p.id} coordinate={aPunto(p.coordenadas)} title={p.nombre} pinColor={color} onCalloutPress={() => onParada?.(p.id)} />
      ))}
    </MapaBase>
  );
}

const crearEstilos = ({ colores }: Tema) =>
  StyleSheet.create({
    marco: { width: '100%', borderWidth: 1, borderColor: colores.borde },
    mapa: { flex: 1 },
    // OpenStreetMap pide que se vea el crédito sobre el mapa.
    atribucion: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      paddingHorizontal: 4,
      fontSize: 10,
      color: '#333333',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
  });
