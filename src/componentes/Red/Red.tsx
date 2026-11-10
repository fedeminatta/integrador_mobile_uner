import { Pressable, ScrollView, Text, View } from 'react-native';

import { Icono } from '@/componentes/Icono/Icono';
import { InsigniaLinea } from '@/componentes/InsigniaLinea/InsigniaLinea';
import { crearEstilos } from '@/componentes/Red/Red.estilos';
import { Tarjeta } from '@/componentes/Tarjeta/Tarjeta';
import { Texto } from '@/componentes/Texto/Texto';
import { useHaptica } from '@/hooks/useHaptica';
import { useEstilos } from '@/tema';
import type { Aviso, Gravedad, Linea, Parada } from '@/tipos/types';
import { rangoDeFechas } from '@/utils/fechas';

// Componentes de líneas, paradas y horarios con los tipos del PRD.

const chipsGravedad: Record<
	Gravedad | 'normal',
	{
		texto: string;
		fondo: 'chipNormal' | 'chipDesvio' | 'chipSuspension' | 'chipInfo';
		color:
			| 'chipTextoNormal'
			| 'chipTextoDesvio'
			| 'chipTextoSuspension'
			| 'chipTextoInfo';
	}
> = {
	normal: { texto: 'Normal', fondo: 'chipNormal', color: 'chipTextoNormal' },
	desvio: {
		texto: 'Con desvío',
		fondo: 'chipDesvio',
		color: 'chipTextoDesvio',
	},
	suspension: {
		texto: 'Suspendida',
		fondo: 'chipSuspension',
		color: 'chipTextoSuspension',
	},
	informativo: {
		texto: 'Informativo',
		fondo: 'chipInfo',
		color: 'chipTextoInfo',
	},
};

export function ChipGravedad({ gravedad }: { gravedad: Gravedad | 'normal' }) {
	const e = useEstilos(crearEstilos);
	const c = chipsGravedad[gravedad];
	return (
		<View style={[e.chip, e[c.fondo]]}>
			<Text style={[e.chipTexto, e[c.color]]}>{c.texto}</Text>
		</View>
	);
}

// La gravedad más alta de los avisos vigentes de una línea (o "normal" si no tiene).
export function estadoDeLinea(gravedades: Gravedad[]): Gravedad | 'normal' {
	if (gravedades.includes('suspension')) return 'suspension';
	if (gravedades.includes('desvio')) return 'desvio';
	return 'normal';
}

type PropsLinea = {
	linea: Linea;
	estado: Gravedad | 'normal';
	favorita?: boolean;
	onPress: () => void;
};

export function TarjetaLineaRed({
	linea,
	estado,
	favorita,
	onPress,
}: PropsLinea) {
	const e = useEstilos(crearEstilos);
	const destinos = linea.recorridos
		.map((r) => r.destino.replace(/^hacia /, ''))
		.join(' ⇄ ');
	return (
		<Tarjeta
			enFila
			onPress={onPress}
			etiquetaAccesible={`Línea ${linea.numero}, ${linea.nombre}`}
		>
			<InsigniaLinea numero={linea.numero} />
			<View style={e.textos}>
				<Texto variante='destacado'>{linea.nombre}</Texto>
				<Texto variante='chico'>
					{linea.activa ? destinos : 'Sin servicio'}
				</Texto>
				<ChipGravedad gravedad={estado} />
			</View>
			{favorita && <Icono nombre='star' tamano={18} color='enlace' />}
			<View style={e.chevron}>
				<Icono nombre='chevron-forward' tamano={20} color='textoSuave' />
			</View>
		</Tarjeta>
	);
}

type PropsParada = {
	parada: Parada;
	numerosLinea?: string[];
	// Posición en el recorrido (1, 2, 3...). Sin orden se muestra el ícono de parada.
	orden?: number;
	favorita?: boolean;
	onPress: () => void;
};

export function TarjetaParadaRed({
	parada,
	numerosLinea,
	orden,
	favorita,
	onPress,
}: PropsParada) {
	const e = useEstilos(crearEstilos);
	return (
		<Tarjeta
			enFila
			onPress={onPress}
			etiquetaAccesible={
				orden ? `Parada ${orden}, ${parada.nombre}` : parada.nombre
			}
		>
			<View style={e.orden}>
				{orden ? (
					<Text style={e.ordenTexto}>{orden}</Text>
				) : (
					<Icono nombre='location' tamano={16} color='enlace' />
				)}
			</View>
			<View style={e.textos}>
				<Texto variante='destacado'>{parada.nombre}</Texto>
				<Texto variante='chico'>
					{parada.refugio ? 'Con refugio' : 'Sin refugio'}
				</Texto>
				{!!numerosLinea?.length && (
					<View style={e.fila}>
						{numerosLinea.map((n, index) => (
							<InsigniaLinea key={`${n}-${index}`} numero={n} chica />
						))}
					</View>
				)}
			</View>
			{favorita && <Icono nombre='star' tamano={18} color='enlace' />}
			<View style={e.chevron}>
				<Icono nombre='chevron-forward' tamano={20} color='textoSuave' />
			</View>
		</Tarjeta>
	);
}

type Opcion<T extends string> = { valor: T; texto: string };

// Botones de elección única en una sola fila (ida/vuelta, tipo de día).
export function Segmentos<T extends string>({
	opciones,
	valor,
	onCambiar,
}: {
	opciones: Opcion<T>[];
	valor: T;
	onCambiar: (v: T) => void;
}) {
	const e = useEstilos(crearEstilos);
	const haptica = useHaptica();
	return (
		<View style={e.segmentos} accessibilityRole='radiogroup'>
			{opciones.map((o) => {
				const activo = o.valor === valor;
				return (
					<Pressable
						key={o.valor}
						accessibilityRole='radio'
						accessibilityState={{ checked: activo }}
						onPress={() => {
							haptica.toque();
							onCambiar(o.valor);
						}}
						style={[e.segmento, activo && e.segmentoActivo]}
					>
						<Text style={[e.segmentoTexto, activo && e.segmentoTextoActivo]}>
							{o.texto}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

// Estrella del encabezado para marcar una línea o parada como favorita.
export function BotonFavorito({
	activo,
	onPress,
}: {
	activo: boolean;
	onPress: () => void;
}) {
	const e = useEstilos(crearEstilos);
	const haptica = useHaptica();
	return (
		<Pressable
			accessibilityRole='button'
			accessibilityLabel={
				activo ? 'Quitar de favoritos' : 'Agregar a favoritos'
			}
			accessibilityState={{ selected: activo }}
			onPress={() => {
				haptica.toque();
				onPress();
			}}
			style={({ pressed }) => [e.botonIcono, pressed && e.presionado]}
		>
			<Icono
				nombre={activo ? 'star' : 'star-outline'}
				tamano={24}
				color='sobreEncabezado'
			/>
		</Pressable>
	);
}

type PropsAviso = {
	aviso: Aviso;
	numerosLinea?: string[];
	onPress: () => void;
};

export function TarjetaAvisoRed({ aviso, numerosLinea, onPress }: PropsAviso) {
	const e = useEstilos(crearEstilos);
	return (
		<Tarjeta
			onPress={onPress}
			etiquetaAccesible={`Aviso: ${aviso.titulo}. Ver detalle`}
		>
			<View style={e.fila}>
				<ChipGravedad gravedad={aviso.gravedad} />
				{numerosLinea?.map((n) => (
					<InsigniaLinea key={n} numero={n} chica />
				))}
			</View>
			<View style={e.fila}>
				<View style={e.textosSinMargen}>
					<Texto variante='destacado'>{aviso.titulo}</Texto>
					<Texto variante='etiqueta'>
						{rangoDeFechas(aviso.desde, aviso.hasta)}
					</Texto>
				</View>
				<Icono nombre='chevron-forward' tamano={20} color='textoSuave' />
			</View>
		</Tarjeta>
	);
}

// Grilla de horas de tabla ("05:20", "05:40"...). La hora resaltada es la próxima en pasar.
export function GrillaHoras({
	horas,
	resaltada,
}: {
	horas: string[];
	resaltada?: string | null;
}) {
	const e = useEstilos(crearEstilos);
	return (
		<View style={e.horas}>
			{horas.map((h) => (
				<View
					key={h}
					style={[e.hora, h === resaltada && e.horaResaltada]}
					accessibilityLabel={h === resaltada ? `${h}, el próximo` : h}
				>
					<Text style={[e.horaTexto, h === resaltada && e.horaTextoResaltada]}>
						{h}
					</Text>
				</View>
			))}
		</View>
	);
}

type PropsTimeline = {
	paradas: Parada[];
	// Color de la línea: la línea vertical y los puntos lo usan, como en un mapa de subte.
	color: string;
	esFavorita: (id: string) => boolean;
	onPress: (id: string) => void;
};

// Paradas del recorrido en orden, unidas por una línea vertical del color de la línea.
export function RecorridoTimeline({
	paradas,
	color,
	esFavorita,
	onPress,
}: PropsTimeline) {
	const e = useEstilos(crearEstilos);
	return (
		<Tarjeta sinRelleno>
			{paradas.map((p, i) => {
				const extremo = i === 0 || i === paradas.length - 1;
				return (
					<Pressable
						key={p.id}
						accessibilityRole='button'
						accessibilityLabel={`Parada ${i + 1}, ${p.nombre}`}
						onPress={() => onPress(p.id)}
						style={({ pressed }) => [e.paso, pressed && e.presionado]}
					>
						<View style={e.riel}>
							<View
								style={[
									e.tramo,
									{ backgroundColor: i === 0 ? 'transparent' : color },
								]}
							/>
							<View
								style={[
									e.punto,
									{ borderColor: color },
									extremo && { backgroundColor: color },
								]}
							/>
							<View
								style={[
									e.tramo,
									{
										backgroundColor:
											i === paradas.length - 1 ? 'transparent' : color,
									},
								]}
							/>
						</View>
						<View style={e.pasoTextos}>
							<Texto variante={extremo ? 'destacado' : 'cuerpo'}>
								{p.nombre}
							</Texto>
							{!p.refugio && <Texto variante='etiqueta'>Sin refugio</Texto>}
						</View>
						{esFavorita(p.id) && (
							<Icono nombre='star' tamano={16} color='enlace' />
						)}
						<Icono nombre='chevron-forward' tamano={18} color='textoSuave' />
					</Pressable>
				);
			})}
		</Tarjeta>
	);
}

// Fila deslizable de líneas para filtrar ("Todas", "5", "14"...). Tocar la elegida la desmarca.
export function ChipsLineas({
	lineas,
	valor,
	onCambiar,
}: {
	lineas: Linea[];
	valor: string | null;
	onCambiar: (id: string | null) => void;
}) {
	const e = useEstilos(crearEstilos);
	const haptica = useHaptica();
	if (!lineas.length) return null;
	const opciones = [
		{ id: null, texto: 'Todas' },
		...lineas.map((l) => ({ id: l.id, texto: `Línea ${l.numero}` })),
	];
	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={e.chips}
			accessibilityRole='radiogroup'
		>
			{opciones.map((o) => {
				const activo = o.id === valor;
				return (
					<Pressable
						key={o.id ?? 'todas'}
						accessibilityRole='radio'
						accessibilityState={{ checked: activo }}
						onPress={() => {
							haptica.toque();
							onCambiar(activo ? null : o.id);
						}}
						style={[e.chipFiltro, activo && e.segmentoActivo]}
					>
						<Text style={[e.segmentoTexto, activo && e.segmentoTextoActivo]}>
							{o.texto}
						</Text>
					</Pressable>
				);
			})}
		</ScrollView>
	);
}

// Insignia con el color propio de la línea (el número va en blanco).
export function InsigniaColor({
	numero,
	color,
	chica,
}: {
	numero: string;
	color: string;
	chica?: boolean;
}) {
	const e = useEstilos(crearEstilos);
	return (
		<View
			style={[
				e.insigniaColor,
				chica && e.insigniaColorChica,
				{ backgroundColor: color },
			]}
			accessibilityLabel={`Línea ${numero}`}
		>
			<Text style={[e.insigniaColorTexto, chica && e.insigniaColorTextoChico]}>
				{numero}
			</Text>
		</View>
	);
}
