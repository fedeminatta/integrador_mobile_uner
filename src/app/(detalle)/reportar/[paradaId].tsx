import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import { Boton } from '@/componentes/Boton/Boton';
import { GrupoBotones } from '@/componentes/Boton/GrupoBotones';
import { CampoTexto } from '@/componentes/CampoTexto/CampoTexto';
import { EsqueletoLista } from '@/componentes/Esqueleto/Esqueleto';
import { ErrorReintentar } from '@/componentes/Estados/Estados';
import { FilaOpcion } from '@/componentes/Filas/Filas';
import { Notificacion } from '@/componentes/Notificacion/Notificacion';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { Segmentos } from '@/componentes/Red/Red';
import { Tarjeta } from '@/componentes/Tarjeta/Tarjeta';
import { useCarga } from '@/hooks/useCarga';
import { useHaptica } from '@/hooks/useHaptica';
import { useSesion } from '@/hooks/useSesion';
import { listarLineasRed, obtenerParada } from '@/servicios/red';
import { enviarReporte, motivosDemora } from '@/servicios/reportes';
import { ErrorApi } from '@/tipos';
import type { MotivoDemora } from '@/tipos/types';

export default function ReportarDemora() {
	const { paradaId } = useLocalSearchParams<{ paradaId: string }>();
	const haptica = useHaptica();
	const { usuario } = useSesion();

	const parada = useCarga(
		useCallback(() => obtenerParada(paradaId), [paradaId]),
	);
	const lineas = useCarga(listarLineasRed);

	const [lineaElegida, setLinea] = useState<string | null>(null);
	const [motivo, setMotivo] = useState<MotivoDemora | null>(null);
	const [comentario, setComentario] = useState('');
	const [enviando, setEnviando] = useState(false);
	const [error, setError] = useState<ErrorApi | null>(null);
	const [enviado, setEnviado] = useState<{ sincronizado: boolean } | null>(
		null,
	);

	const lineasDeParada = (lineas.datos ?? []).filter((l) =>
		parada.datos?.lineaIds.includes(l.id),
	);
	// Si por la parada pasa una sola línea, ya queda elegida.
	const lineaId =
		lineaElegida ?? (lineasDeParada.length === 1 ? lineasDeParada[0].id : null);

	const enviar = async () => {
		if (!lineaId || !motivo || !usuario) return;
		setEnviando(true);
		setError(null);
		const r = await enviarReporte(
			{ lineaId, paradaId, motivo, comentario: comentario.trim() || null },
			usuario,
		);
		setEnviando(false);
		if ('error' in r) {
			haptica.error();
			setError(r.error);
			return;
		}
		// Vibración de confirmación: el reporte llegó (o quedó guardado para enviarse solo).
		haptica.exito();
		setEnviado({ sincronizado: r.datos.sincronizado });
	};

	return (
		<Pantalla>
			<Stack.Screen options={{ title: 'Reportar demora' }} />

			{parada.cargando || lineas.cargando ? (
				<EsqueletoLista variante='formulario' cantidad={2} />
			) : parada.error ? (
				<ErrorReintentar error={parada.error} onReintentar={parada.recargar} />
			) : lineas.error ? (
				<ErrorReintentar error={lineas.error} onReintentar={lineas.recargar} />
			) : enviado ? (
				<>
					{enviado.sincronizado ? (
						<Notificacion
							tipo='exito'
							titulo='¡Gracias por avisar!'
							mensaje={`Los pasajeros de ${parada.datos?.nombre} ya pueden ver tu reporte.`}
						/>
					) : (
						<Notificacion
							tipo='info'
							titulo='Guardado sin conexión'
							mensaje='Lo vamos a enviar solo en cuanto vuelva la señal, no hace falta que hagas nada.'
						/>
					)}
					<Boton
						texto='Volver a la parada'
						icono='arrow-back'
						onPress={() => router.back()}
					/>
				</>
			) : (
				<>
					{!usuario && (
						<>
							<Notificacion
								tipo='info'
								titulo='Inicia sesión para reportar'
								mensaje='Así evitamos reportes falsos. Mirar horarios no necesita cuenta.'
							/>
							<GrupoBotones>
								<Boton
									texto='Iniciar sesión'
									icono='log-in-outline'
									onPress={() => router.push('/login')}
								/>
								<Boton
									texto='Crear cuenta'
									variante='secundario'
									icono='person-add-outline'
									onPress={() => router.push('/registro')}
								/>
							</GrupoBotones>
						</>
					)}

					<Seccion
						titulo='¿Qué línea esperas?'
						descripcion={parada.datos?.nombre}
					>
						<Segmentos
							opciones={lineasDeParada.map((l) => ({
								valor: l.id,
								texto: `Línea ${l.numero}`,
							}))}
							valor={lineaId ?? ''}
							onCambiar={setLinea}
						/>
					</Seccion>

					<Seccion titulo='¿Qué pasó?'>
						<Tarjeta sinRelleno>
							{motivosDemora.map((m, i) => (
								<FilaOpcion
									key={m.motivo}
									titulo={m.titulo}
									conDivisor={i > 0}
									activa={motivo === m.motivo}
									onElegir={() => setMotivo(m.motivo)}
								/>
							))}
						</Tarjeta>
					</Seccion>

					<Seccion titulo='Comentario' descripcion='Opcional'>
						<CampoTexto
							etiqueta='Para los demás pasajeros'
							valor={comentario}
							onCambiar={setComentario}
							placeholder='Por ejemplo: el de las 10:42 no pasó'
						/>
						{/* Sacar foto o elegirla de la galería (expo-camera / expo-image-picker) va acá. */}
					</Seccion>

					{error && (
						<Notificacion
							tipo='error'
							titulo='No se pudo enviar'
							mensaje={error.mensaje}
							onCerrar={() => setError(null)}
						/>
					)}
					<Boton
						texto='Enviar reporte'
						icono='send'
						cargando={enviando}
						deshabilitado={!usuario || !lineaId || !motivo}
						onPress={enviar}
					/>
				</>
			)}
		</Pantalla>
	);
}
