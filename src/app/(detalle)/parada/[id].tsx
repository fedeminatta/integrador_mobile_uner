import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Linking, Share, View } from 'react-native';

import { Acordeon, ItemAcordeon } from '@/componentes/Acordeon/Acordeon';
import { Boton } from '@/componentes/Boton/Boton';
import { GrupoBotones } from '@/componentes/Boton/GrupoBotones';
import { EsqueletoLista } from '@/componentes/Esqueleto/Esqueleto';
import { EstadoVacio, ErrorReintentar } from '@/componentes/Estados/Estados';
import { FlechaRumbo } from '@/componentes/FlechaRumbo/FlechaRumbo';
import { InsigniaLinea } from '@/componentes/InsigniaLinea/InsigniaLinea';
import { Notificacion } from '@/componentes/Notificacion/Notificacion';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { BotonFavorito, GrillaHoras } from '@/componentes/Red/Red';
import { crearEstilos } from '@/componentes/Red/Red.estilos';
import { Tarjeta } from '@/componentes/Tarjeta/Tarjeta';
import { Texto } from '@/componentes/Texto/Texto';
import { useAhora } from '@/hooks/useAhora';
import { useCarga } from '@/hooks/useCarga';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useHaptica } from '@/hooks/useHaptica';
import { useRecientes } from '@/hooks/useRecientes';
import { useSesion } from '@/hooks/useSesion';
import { useUbicacion } from '@/hooks/useUbicacion';
import { claveRecordatorio, programarRecordatorio, recordatoriosActivos } from '@/servicios/recordatorios';
import { horariosDeParada, listarFeriados, listarLineasRed, obtenerParada, proximosEnParadaRed } from '@/servicios/red';
import { confirmarReporte, reportesDeParada, tituloMotivo } from '@/servicios/reportes';
import { useEstilos } from '@/tema';
import { ErrorApi } from '@/tipos';
import type { Horario, Linea, Parada, TipoDeDia } from '@/tipos/types';
import { esDeManana, etiquetaTipoDeDia, haceCuanto, minutosHasta, tipoDeDia } from '@/utils/tablas';

type PropsProximos = {
  linea: Linea | undefined;
  parada: Parada;
  horarios: Horario[];
  ahora: Date;
  conRecordatorio: boolean;
  onRecordar: (hora: string) => void;
};

// Sin GPS en los colectivos: siempre "según la tabla", nunca "llega en".
function TarjetaProximos({ linea, parada, horarios, ahora, conRecordatorio, onRecordar }: PropsProximos) {
  const e = useEstilos(crearEstilos);
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
      {conRecordatorio ? (
        <Texto variante="etiqueta" tono="exito">
          Te avisamos 10 minutos antes del de las {primero.hora}
        </Texto>
      ) : (
        minutos > 10 && (
          <Boton texto={`Avisarme 10 min antes del de las ${primero.hora}`} variante="texto" icono="alarm-outline" onPress={() => onRecordar(primero.hora)} />
        )
      )}
    </Tarjeta>
  );
}

// Todos los horarios del día de una línea en la parada, con el próximo resaltado.
function TablaDelDia({ lineaId, paradaId, tipo, proxima }: { lineaId: string; paradaId: string; tipo: TipoDeDia; proxima: string | null }) {
  const horarios = useCarga(useCallback(() => horariosDeParada(lineaId, paradaId, tipo), [lineaId, paradaId, tipo]));
  if (horarios.cargando) return <EsqueletoLista variante="horario" cantidad={1} />;
  if (horarios.error) return <ErrorReintentar error={horarios.error} onReintentar={horarios.recargar} />;
  if (!horarios.datos?.length) return <Texto variante="chico">Sin servicio los {etiquetaTipoDeDia(tipo).toLowerCase()}.</Texto>;
  return <GrillaHoras horas={horarios.datos.map((h) => h.hora)} resaltada={proxima} />;
}

export default function DetalleParada() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const e = useEstilos(crearEstilos);
  const favoritos = useFavoritos();
  const haptica = useHaptica();
  const { usuario } = useSesion();
  const { registrar } = useRecientes();
  const ubicacion = useUbicacion();
  const ahora = useAhora();

  const parada = useCarga(useCallback(() => obtenerParada(id), [id]));
  const proximos = useCarga(useCallback(() => proximosEnParadaRed(id), [id]));
  const reportes = useCarga(useCallback(() => reportesDeParada(id), [id]));
  const lineas = useCarga(listarLineasRed);
  const feriados = useCarga(listarFeriados);

  const [confirmados, setConfirmados] = useState<string[]>([]);
  const [errorConfirmar, setErrorConfirmar] = useState<ErrorApi | null>(null);
  const [recordatorios, setRecordatorios] = useState<string[]>([]);
  const [avisoRecordatorio, setAvisoRecordatorio] = useState<string | null>(null);

  // La parada queda en "recientes" del inicio.
  useEffect(() => {
    if (parada.datos) registrar(parada.datos.id);
  }, [parada.datos, registrar]);

  useEffect(() => {
    recordatoriosActivos().then((r) => setRecordatorios(r.map((x) => x.clave)));
  }, []);

  const lineaDe = (lineaId: string) => lineas.datos?.find((l) => l.id === lineaId);
  const lineasConProximos = [...new Set((proximos.datos ?? []).map((h) => h.lineaId))];
  const proximosDe = (lineaId: string) => (proximos.datos ?? []).filter((h) => h.lineaId === lineaId);
  const tipoHoy = tipoDeDia(ahora, feriados.datos ?? []);

  const comoLlegar = () => {
    if (!parada.datos) return;
    const { latitud, longitud } = parada.datos.coordenadas;
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitud},${longitud}&travelmode=walking`);
  };

  const compartir = () => {
    if (!parada.datos) return;
    const pasos = lineasConProximos
      .map((lineaId) => {
        const [primero] = proximosDe(lineaId);
        const cuando = esDeManana(primero.hora, ahora) ? `mañana a las ${primero.hora}` : `a las ${primero.hora}`;
        return `el ${lineaDe(lineaId)?.numero ?? ''} pasa ${cuando}`;
      })
      .join(', ');
    Share.share({ message: `Estoy en la parada ${parada.datos.nombre}${pasos ? `: ${pasos}, según la tabla` : ''}. (Paran)` }).catch(() => {});
  };

  const recordar = async (linea: Linea | undefined, hora: string) => {
    if (!parada.datos || !linea) return;
    const resultado = await programarRecordatorio({
      lineaId: linea.id,
      lineaNumero: linea.numero,
      paradaId: parada.datos.id,
      paradaNombre: parada.datos.nombre,
      hora,
    });
    if (resultado === 'programado') {
      haptica.exito();
      setRecordatorios((r) => [...r, claveRecordatorio(linea.id, parada.datos!.id, hora)]);
      setAvisoRecordatorio(null);
    } else {
      haptica.error();
      setAvisoRecordatorio(
        resultado === 'sin-permiso'
          ? 'Para avisarte hace falta el permiso de notificaciones. Puedes activarlo en los ajustes del teléfono.'
          : 'Falta muy poco para ese colectivo: ya no llegamos a avisarte 10 minutos antes.',
      );
    }
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
              {ubicacion && (
                <FlechaRumbo
                  latUsuario={ubicacion.latitud}
                  lonUsuario={ubicacion.longitud}
                  latParada={parada.datos.coordenadas.latitud}
                  lonParada={parada.datos.coordenadas.longitud}
                />
              )}
              <GrupoBotones>
                <Boton texto="Cómo llegar caminando" variante="secundario" icono="walk-outline" onPress={comoLlegar} />
                <Boton texto="Compartir parada y horarios" variante="secundario" icono="share-social-outline" onPress={compartir} />
              </GrupoBotones>
            </Seccion>

            <Seccion titulo="Próximos colectivos" descripcion="Horarios de la tabla, no la posición real">
              {avisoRecordatorio && (
                <Notificacion tipo="info" titulo="No se pudo programar el aviso" mensaje={avisoRecordatorio} onCerrar={() => setAvisoRecordatorio(null)} />
              )}
              {proximos.cargando ? (
                <EsqueletoLista variante="horario" cantidad={2} />
              ) : proximos.error ? (
                <ErrorReintentar error={proximos.error} onReintentar={proximos.recargar} />
              ) : lineasConProximos.length ? (
                lineasConProximos.map((lineaId) => {
                  const horarios = proximosDe(lineaId);
                  return (
                    <TarjetaProximos
                      key={lineaId}
                      linea={lineaDe(lineaId)}
                      parada={parada.datos!}
                      horarios={horarios}
                      ahora={ahora}
                      conRecordatorio={recordatorios.includes(claveRecordatorio(lineaId, id, horarios[0].hora))}
                      onRecordar={(hora) => recordar(lineaDe(lineaId), hora)}
                    />
                  );
                })
              ) : (
                <EstadoVacio icono="moon-outline" titulo="Sin servicio hoy ni mañana" mensaje="Ninguna línea tiene horarios en esta parada." />
              )}
            </Seccion>

            {lineasConProximos.length > 0 && (
              <Seccion titulo={`Horarios de hoy (${etiquetaTipoDeDia(tipoHoy).toLowerCase()})`} descripcion="Resaltado, el próximo en pasar">
                <Acordeon>
                  {lineasConProximos.map((lineaId) => {
                    const [primero] = proximosDe(lineaId);
                    return (
                      <ItemAcordeon key={lineaId} titulo={`Línea ${lineaDe(lineaId)?.numero ?? ''}`} icono="time-outline">
                        <TablaDelDia
                          lineaId={lineaId}
                          paradaId={id}
                          tipo={tipoHoy}
                          proxima={primero && !esDeManana(primero.hora, ahora) ? primero.hora : null}
                        />
                      </ItemAcordeon>
                    );
                  })}
                </Acordeon>
              </Seccion>
            )}

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
                          {haceCuanto(r.fechaHora, ahora)} ·{' '}
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
