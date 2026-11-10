import {
	Camera,
	GeoJSONSource,
	Layer,
	Map as MapaMapLibre,
	UserLocation,
} from '@maplibre/maplibre-react-native';
import { ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Tema, useEstilos } from '@/tema';
import type { Coordenadas, Parada } from '@/tipos/types';

// Estilo del mapa. OpenFreeMap es gratuito y no pide clave ni cuenta.
export const ESTILO_MAPA = 'https://tiles.openfreemap.org/styles/liberty';

// Alternativa si OpenFreeMap no responde: baldosas raster de OpenStreetMap.
// export const ESTILO_MAPA = {
//   version: 8 as const,
//   sources: {
//     osm: { type: 'raster' as const, tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, maxzoom: 19 },
//   },
//   layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }],
// };

// El crédito tiene que verse sobre el mapa (lo piden OpenStreetMap y OpenFreeMap).
const ATRIBUCION = '© OpenStreetMap · OpenFreeMap';

export const CENTRO_PARANA: Coordenadas = {
	latitud: -31.7333,
	longitud: -60.5241,
};

export type Region = {
	latitude: number;
	longitude: number;
	latitudeDelta: number;
	longitudeDelta: number;
};

export const REGION_PARANA: Region = {
	latitude: CENTRO_PARANA.latitud,
	longitude: CENTRO_PARANA.longitud,
	latitudeDelta: 0.06,
	longitudeDelta: 0.06,
};

export const aPunto = (c: Coordenadas) => ({
	latitude: c.latitud,
	longitude: c.longitud,
});

// Región que encuadra todos los puntos, con un margen alrededor.
export function regionDe(puntos: Coordenadas[]): Region {
	if (!puntos.length) return REGION_PARANA;
	const lats = puntos.map((p) => p.latitud);
	const lons = puntos.map((p) => p.longitud);
	const [minLat, maxLat, minLon, maxLon] = [
		Math.min(...lats),
		Math.max(...lats),
		Math.min(...lons),
		Math.max(...lons),
	];
	return {
		latitude: (minLat + maxLat) / 2,
		longitude: (minLon + maxLon) / 2,
		latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.01),
		longitudeDelta: Math.max((maxLon - minLon) * 1.5, 0.01),
	};
}

// MapLibre encuadra con límites [oeste, sur, este, norte] (en vez de centro y delta).
function limitesDeRegion(r: Region): [number, number, number, number] {
	return [
		r.longitude - r.longitudeDelta / 2,
		r.latitude - r.latitudeDelta / 2,
		r.longitude + r.longitudeDelta / 2,
		r.latitude + r.latitudeDelta / 2,
	];
}

// GeoJSON usa [longitud, latitud] (al revés que latitud/longitud).
export function geoPuntos(paradas: Parada[]) {
	return {
		type: 'FeatureCollection' as const,
		features: paradas.map((p) => ({
			type: 'Feature' as const,
			properties: { id: p.id, nombre: p.nombre },
			geometry: {
				type: 'Point' as const,
				coordinates: [p.coordenadas.longitud, p.coordenadas.latitud],
			},
		})),
	};
}

export function geoLinea(puntos: Coordenadas[]) {
	return {
		type: 'Feature' as const,
		properties: {},
		geometry: {
			type: 'LineString' as const,
			coordinates: puntos.map((c) => [c.longitud, c.latitud]),
		},
	};
}

type Enfoque = { centro: Coordenadas; zoom: number };

type PropsBase = {
	region: Region;
	alto?: number;
	conUbicacion?: boolean;
	etiqueta: string;
	/** Si viene, la cámara se acerca a este punto con una animación. */
	enfocar?: Enfoque | null;
	children?: ReactNode;
};

// Mapa de MapLibre con su crédito. Encuadra la región inicial y, si se pide, se acerca a un punto.
export function MapaBase({
	region,
	alto = 220,
	conUbicacion = false,
	etiqueta,
	enfocar = null,
	children,
}: PropsBase) {
	const e = useEstilos(crearEstilos);

	const destino = enfocar
		? {
				center: [enfocar.centro.longitud, enfocar.centro.latitud] as [
					number,
					number,
				],
				zoom: enfocar.zoom,
				duration: 600,
				easing: 'ease' as const,
			}
		: {};

	return (
		// Sin borderRadius ni overflow: 'hidden': en Android recortar el mapa puede dibujarlo en negro.
		<View style={[e.marco, { height: alto }]}>
			<MapaMapLibre
				style={e.mapa}
				mapStyle={ESTILO_MAPA}
				attribution={false}
				accessibilityLabel={etiqueta}
			>
				<Camera
					initialViewState={{ bounds: limitesDeRegion(region) }}
					{...destino}
				/>
				{conUbicacion && <UserLocation />}
				{children}
			</MapaMapLibre>
			<Text style={e.atribucion}>{ATRIBUCION}</Text>
		</View>
	);
}

type PropsCapaParadas = {
	/** Prefijo para los ids internos de las capas (único dentro de cada mapa). */
	idBase: string;
	paradas: Parada[];
	color: string;
	seleccionada?: string | null;
	onPress?: (id: string) => void;
};

// Paradas como puntos. La seleccionada va aparte, más grande y en rojo.
export function CapaParadas({
	idBase,
	paradas,
	color,
	seleccionada = null,
	onPress,
}: PropsCapaParadas) {
	const normales = useMemo(
		() => geoPuntos(paradas.filter((p) => p.id !== seleccionada)),
		[paradas, seleccionada],
	);
	const marcada = useMemo(
		() => geoPuntos(paradas.filter((p) => p.id === seleccionada)),
		[paradas, seleccionada],
	);

	const tocar = (id: unknown) => {
		if (id != null) onPress?.(String(id));
	};
	// Zona de toque más grande que el punto dibujado.
	const zonaDeToque = { top: 22, right: 22, bottom: 22, left: 22 };

	return (
		<>
			<GeoJSONSource
				id={`${idBase}-normales`}
				data={normales}
				hitbox={zonaDeToque}
				onPress={(ev) => tocar(ev.nativeEvent.features?.[0]?.properties?.id)}
			>
				<Layer
					id={`${idBase}-normales-capa`}
					type='circle'
					paint={{
						'circle-radius': 7,
						'circle-color': color,
						'circle-stroke-width': 2,
						'circle-stroke-color': '#FFFFFF',
					}}
				/>
			</GeoJSONSource>
			<GeoJSONSource
				id={`${idBase}-marcada`}
				data={marcada}
				hitbox={zonaDeToque}
				onPress={(ev) => tocar(ev.nativeEvent.features?.[0]?.properties?.id)}
			>
				<Layer
					id={`${idBase}-marcada-capa`}
					type='circle'
					paint={{
						'circle-radius': 10,
						'circle-color': '#D9534F',
						'circle-stroke-width': 3,
						'circle-stroke-color': '#FFFFFF',
					}}
				/>
			</GeoJSONSource>
		</>
	);
}

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

export function MapaRecorrido({
	trazado,
	color,
	alternativo,
	colorAlternativo = '#D9534F',
	paradas = [],
	onParada,
	etiqueta,
}: PropsRecorrido) {
	const todos = [
		...trazado,
		...(alternativo ?? []),
		...paradas.map((p) => p.coordenadas),
	];
	const datosTrazado = useMemo(() => geoLinea(trazado), [trazado]);
	const datosAlternativo = useMemo(
		() => (alternativo ? geoLinea(alternativo) : null),
		[alternativo],
	);

	return (
		// La key fuerza a encuadrar de nuevo cuando cambia el recorrido (por ejemplo, de ida a vuelta).
		<MapaBase
			key={todos.map((p) => `${p.latitud},${p.longitud}`).join('|')}
			region={regionDe(todos)}
			etiqueta={etiqueta}
		>
			{trazado.length > 1 && (
				<GeoJSONSource id='recorrido-trazado' data={datosTrazado}>
					<Layer
						id='recorrido-trazado-capa'
						type='line'
						paint={{ 'line-color': color, 'line-width': 5 }}
						layout={{ 'line-cap': 'round', 'line-join': 'round' }}
					/>
				</GeoJSONSource>
			)}
			{datosAlternativo && alternativo && alternativo.length > 1 && (
				<GeoJSONSource id='recorrido-alternativo' data={datosAlternativo}>
					<Layer
						id='recorrido-alternativo-capa'
						type='line'
						paint={{
							'line-color': colorAlternativo,
							'line-width': 5,
							'line-dasharray': [2, 1.5],
						}}
						layout={{ 'line-join': 'round' }}
					/>
				</GeoJSONSource>
			)}
			{paradas.length > 0 && (
				<CapaParadas
					idBase='recorrido-paradas'
					paradas={paradas}
					color={color}
					onPress={onParada}
				/>
			)}
		</MapaBase>
	);
}

const crearEstilos = ({ colores }: Tema) =>
	StyleSheet.create({
		marco: { width: '100%', borderWidth: 1, borderColor: colores.borde },
		mapa: { flex: 1 },
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
