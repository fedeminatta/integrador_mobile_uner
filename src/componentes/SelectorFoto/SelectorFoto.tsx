// src/componentes/SelectorFoto/SelectorFoto.tsx
import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Icono } from '@/componentes/Icono/Icono';
import { Texto } from '@/componentes/Texto/Texto';
import { useHaptica } from '@/hooks/useHaptica';
import { usePermisos } from '@/hooks/usePermisos';
import { Tema, useEstilos } from '@/tema';

type Props = {
	uri: string | null;
	onCambiar: (uri: string | null) => void;
};

const OPCIONES: ImagePicker.ImagePickerOptions = {
	mediaTypes: ['images'],
	allowsEditing: true,
	aspect: [4, 3],
	quality: 0.8,
};

export function SelectorFoto({ uri, onCambiar }: Props) {
	const e = useEstilos(crearEstilos);
	const haptica = useHaptica();
	const { estados, pedir, abrirAjustes } = usePermisos();

	const abrirCamara = useCallback(async () => {
		// Pedir permiso si todavía no se determinó; si está bloqueado abrir Ajustes.
		if (estados.camara === 'bloqueado') {
			abrirAjustes();
			return;
		}
		if (estados.camara !== 'concedido') {
			const nuevo = await pedir('camara');
			if (nuevo !== 'concedido') return;
		}
		const r = await ImagePicker.launchCameraAsync(OPCIONES);
		if (!r.canceled && r.assets[0]) {
			haptica.exito();
			onCambiar(r.assets[0].uri);
		}
	}, [estados.camara, pedir, abrirAjustes, haptica, onCambiar]);

	const abrirGaleria = useCallback(async () => {
		// La galería no pide permiso para abrirse (SDK 57).
		const r = await ImagePicker.launchImageLibraryAsync(OPCIONES);
		if (!r.canceled && r.assets[0]) {
			haptica.exito();
			onCambiar(r.assets[0].uri);
		}
	}, [haptica, onCambiar]);

	const quitar = useCallback(() => {
		haptica.toque();
		onCambiar(null);
	}, [haptica, onCambiar]);

	if (uri) {
		return (
			<View style={e.contenedor}>
				{/* Tag "Foto adjunta" */}
				<View style={e.tag}>
					<Icono nombre='checkmark-circle' tamano={14} />
					<Texto variante='etiqueta' style={e.tagTexto}>
						Foto adjunta
					</Texto>
				</View>

				{/* Miniatura con bordes redondeados */}
				<Image source={{ uri }} style={e.miniatura} resizeMode='cover' />

				{/* Botones de reemplazar y quitar */}
				<View style={e.acciones}>
					<TouchableOpacity
						style={e.botonAccion}
						onPress={abrirCamara}
						accessibilityLabel='Sacar otra foto'
					>
						<Icono nombre='camera-outline' tamano={18} />
						<Texto variante='etiqueta' style={e.botonTexto}>
							Cambiar
						</Texto>
					</TouchableOpacity>
					<TouchableOpacity
						style={[e.botonAccion, e.botonQuitar]}
						onPress={quitar}
						accessibilityLabel='Quitar foto'
					>
						<Icono nombre='trash-outline' tamano={18} />
						<Texto variante='etiqueta' style={e.botonTexto}>
							Quitar
						</Texto>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	return (
		<View style={e.contenedor}>
			<View style={e.botones}>
				<TouchableOpacity
					style={e.boton}
					onPress={abrirCamara}
					accessibilityLabel='Sacar una foto'
				>
					<Icono nombre='camera-outline' tamano={24} />
					<Texto variante='etiqueta' style={e.botonTexto}>
						Cámara
					</Texto>
				</TouchableOpacity>
				<View style={e.divisor} />
				<TouchableOpacity
					style={e.boton}
					onPress={abrirGaleria}
					accessibilityLabel='Elegir de la galería'
				>
					<Icono nombre='images-outline' tamano={24} />
					<Texto variante='etiqueta' style={e.botonTexto}>
						Galería
					</Texto>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const crearEstilos = ({ colores }: Tema) =>
	StyleSheet.create({
		contenedor: { gap: 8 },

		// Sin foto: dos botones lado a lado.
		botones: {
			flexDirection: 'row',
			borderWidth: 1,
			borderColor: colores.borde,
			borderRadius: 12,
			borderStyle: 'dashed',
			overflow: 'hidden',
		},
		boton: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 8,
			paddingVertical: 14,
		},
		divisor: { width: 1, backgroundColor: colores.borde },

		// Con foto: miniatura y botones de acción.
		tag: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 4,
			alignSelf: 'flex-start',
			backgroundColor: colores.exito,
			paddingHorizontal: 10,
			paddingVertical: 4,
			borderRadius: 6,
		},
		tagTexto: { color: '#FFFFFF' },
		miniatura: {
			width: '100%',
			height: 180,
			borderRadius: 12,
		},
		acciones: {
			flexDirection: 'row',
			gap: 8,
		},
		botonAccion: {
			flex: 1,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 6,
			paddingVertical: 10,
			borderWidth: 1,
			borderColor: colores.borde,
			borderRadius: 6,
		},
		botonQuitar: { borderColor: colores.error },
		botonTexto: { fontSize: 13 },
	});
