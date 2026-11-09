import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, View } from 'react-native';

import { Boton } from '@/componentes/Boton/Boton';
import { EsqueletoLista } from '@/componentes/Esqueleto/Esqueleto';
import { EstadoVacio, ErrorReintentar } from '@/componentes/Estados/Estados';
import { InsigniaLinea } from '@/componentes/InsigniaLinea/InsigniaLinea';
import { Notificacion } from '@/componentes/Notificacion/Notificacion';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { BotonFavorito } from '@/componentes/Red/Red';
import { crearEstilos } from '@/componentes/Red/Red.estilos';
import { Tarjeta } from '@/componentes/Tarjeta/Tarjeta';
import { Texto } from '@/componentes/Texto/Texto';
import { useCarga } from '@/hooks/useCarga';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useHaptica } from '@/hooks/useHaptica';
import { useSesion } from '@/hooks/useSesion';
import { listarLineasRed, obtenerParada, proximosEnParadaRed } from '@/servicios/red';
import { confirmarReporte, reportesDeParada, tituloMotivo } from '@/servicios/reportes';
import { useEstilos } from '@/tema';
import { ErrorApi } from '@/tipos';
import type { Horario, Linea, Parada } from '@/tipos/types';
import { esDeManana, haceCuanto, minutosHasta } from '@/utils/tablas';

// Sin GPS en los colectivos: siempre "según la tabla", nunca "llega en".
function TarjetaProximos({ linea, parada, horarios }: { linea: Linea | undefined; parada: Parada; horarios: Horario[] }) {
  const e = useEstilos(crearEstilos);
  const ahora = new Date();
  const [primero, ...siguientes] = horarios;
  const destino = linea?.recorridos.find((r) => r.sentido === parada.sentido)?.destino;
  const terminoHoy = esDeManana(primero.hora, ahora);
  const minutos = minutosHasta(primero.hora, ahora);

  return (
    <Tarjeta>
      <View style={e.fila}>
        <InsigniaLinea numero={linea?.numero ?? '?'} />
        <View style={e.textos}>
          <Texto variante="destacado">Línea {linea?.numero}</Texto>
          {!!destino && <Texto variante="chico">{destino}</Texto>}
        </View>
      </View>
      {terminoHoy ? (
        <Texto>
          No hay más servicio hasta mañana a las <Texto variante="destacado">{primero.hora}</Texto>.
        </Texto>
      ) : (
        <View>
          <Texto variante="chico">Según la tabla pasa a las</Texto>
          <Texto variante="hora">
            {primero.hora} <Texto variante="chico">{minutos === 0 ? '(ahora)' : `(en ${minutos} min)`}</Texto>
          </Texto>
          {siguientes.length > 0 && <Texto variante="chico">Después: {siguientes.map((h) => h.hora).join(' · ')}</Texto>}
        </View>
      )}
    </Tarjeta>
  );
}

export default function DetalleParada() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const e = useEstilos(crearEstilos);
  const favoritos = useFavoritos();
  const haptica = useHaptica();
  const { usuario } = useSesion();

  const parada = useCarga(useCallback(() => obtenerParada(id), [id]));
  const proximos = useCarga(useCallback(() => proximosEnParadaRed(id), [id]));
  const reportes = useCarga(useCallback(() => reportesDeParada(id), [id]));
  const lineas = useCarga(listarLineasRed);

  const [confirmados, setConfirmados] = useState<string[]>([]);
  const [errorConfirmar, setErrorConfirmar] = useState<ErrorApi | null>(null);

  const lineaDe = (lineaId: string) => lineas.datos?.find((l) => l.id === lineaId);
  const lineasConProximos = [...new Set((proximos.datos ?? []).map((h) => h.lineaId))];

  const comoLlegar = () => {
    if (!parada.datos) return;
    const { latitud, longitud } = parada.datos.coordenadas;
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitud},${longitud}&travelmode=walking`);
  };

  const confirmar = async (reporteId: string) => {
    setErrorConfirmar(null);
    const r = await confirmarReporte(reporteId);
    if ('error' in r) {
      haptica.error();
      setErrorConfirmar(r.error);
      return;
    }
    haptica.exito();
    setConfirmados((c) => [...c, reporteId]);
    reportes.recargar();
  };

  return (
    <Pantalla>
      <Stack.Screen
        options={{
          title: parada.datos?.nombre ?? 'Parada',
          headerRight: () => <BotonFavorito activo={favoritos.esParadaFavorita(id)} onPress={() => favoritos.alternarParada(id)} />,
        }}
      />

      {parada.cargando ? (
        <EsqueletoLista variante="parada" cantidad={1} />
      ) : parada.error ? (
        <ErrorReintentar error={parada.error} onReintentar={parada.recargar} />
      ) : (
        parada.datos && (
          <>
            <Seccion
              titulo={parada.datos.sentido === 'ida' ? 'Sentido ida' : 'Sentido vuelta'}
              descripcion={parada.datos.refugio ? 'Tiene refugio' : 'No tiene refugio'}>
              {/* La flecha hacia la parada (magnetómetro) va en esta sección. */}
              <Boton texto="Cómo llegar caminando" variante="secundario" icono="walk-outline" onPress={comoLlegar} />
            </Seccion>

            <Seccion titulo="Próximos colectivos" descripcion="Horarios de la tabla, no la posición real">
              {proximos.cargando ? (
                <EsqueletoLista variante="horario" cantidad={2} />
              ) : proximos.error ? (
                <ErrorReintentar error={proximos.error} onReintentar={proximos.recargar} />
              ) : lineasConProximos.length ? (
                lineasConProximos.map((lineaId) => (
                  <TarjetaProximos
                    key={lineaId}
                    linea={lineaDe(lineaId)}
                    parada={parada.datos!}
                    horarios={(proximos.datos ?? []).filter((h) => h.lineaId === lineaId)}
                  />
                ))
              ) : (
                <EstadoVacio icono="moon-outline" titulo="Sin servicio hoy ni mañana" mensaje="Ninguna línea tiene horarios en esta parada." />
              )}
            </Seccion>

            <Seccion titulo="Reportes de pasajeros" descripcion="De la última hora y media">
              {errorConfirmar && <Notificacion tipo="error" titulo="No se pudo confirmar" mensaje={errorConfirmar.mensaje} onCerrar={() => setErrorConfirmar(null)} />}
              {reportes.cargando ? (
                <EsqueletoLista variante="aviso" cantidad={1} />
              ) : reportes.error ? (
                <ErrorReintentar error={reportes.error} onReintentar={reportes.recargar} />
              ) : reportes.datos?.length ? (
                reportes.datos.map((r) => (
                  <Tarjeta key={r.id}>
                    <View style={e.fila}>
                      <InsigniaLinea numero={lineaDe(r.lineaId)?.numero ?? '?'} chica />
                      <View style={e.textos}>
                        <Texto variante="destacado">{tituloMotivo(r.motivo)}</Texto>
                        <Texto variante="chico">
                          {haceCuanto(r.fechaHora, new Date())} ·{' '}
                          {r.confirmaciones === 1 ? '1 persona lo confirmó' : `${r.confirmaciones} personas lo confirmaron`}
                        </Texto>
                      </View>
                    </View>
                    {!!r.comentario && <Texto>{r.comentario}</Texto>}
                    {usuario &&
                      (confirmados.includes(r.id) ? (
                        <Texto variante="etiqueta" tono="exito">
                          Confirmaste este reporte
                        </Texto>
                      ) : (
                        <Boton texto="A mí también me pasa" variante="secundario" icono="checkmark" onPress={() => confirmar(r.id)} />
                      ))}
                  </Tarjeta>
                ))
              ) : (
                <EstadoVacio icono="checkmark-done-outline" titulo="Nadie reportó demoras" mensaje="Si tu colectivo no pasa, avisa a los demás." />
              )}
              <Boton texto="Reportar una demora" icono="time-outline" onPress={() => router.push({ pathname: '/reportar/[paradaId]', params: { paradaId: id } })} />
            </Seccion>
          </>
        )
      )}
    </Pantalla>
  );
}
