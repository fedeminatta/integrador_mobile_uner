import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import { EsqueletoLista } from '@/componentes/Esqueleto/Esqueleto';
import { EstadoVacio, ErrorReintentar } from '@/componentes/Estados/Estados';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { MapaRecorrido } from '@/componentes/Mapa/Mapa';
import { BotonFavorito, GrillaHoras, RecorridoTimeline, Segmentos, TarjetaAvisoRed } from '@/componentes/Red/Red';
import { Texto } from '@/componentes/Texto/Texto';
import { useCarga } from '@/hooks/useCarga';
import { useFavoritos } from '@/hooks/useFavoritos';
import { horariosDeParada, listarAvisosRed, listarFeriados, obtenerLinea, paradasDeLinea } from '@/servicios/red';
import { responder } from '@/servicios/simulador';
import type { Horario, Sentido, TipoDeDia } from '@/tipos/types';
import { etiquetaTipoDeDia, tipoDeDia } from '@/utils/tablas';

const tiposDeDia: TipoDeDia[] = ['habil', 'sabado', 'domingo', 'feriado'];

export default function DetalleLinea() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const favoritos = useFavoritos();

  const linea = useCarga(useCallback(() => obtenerLinea(id), [id]));
  const paradas = useCarga(useCallback(() => paradasDeLinea(id), [id]));
  const avisos = useCarga(useCallback(() => listarAvisosRed(id), [id]));
  const feriados = useCarga(listarFeriados);

  const [sentidoElegido, setSentido] = useState<Sentido>('ida');
  const [tipoElegido, setTipo] = useState<TipoDeDia | null>(null);

  const recorridos = linea.datos?.recorridos ?? [];
  // Si la línea no tiene vuelta, se muestra el único recorrido que hay.
  const recorrido = recorridos.find((r) => r.sentido === sentidoElegido) ?? recorridos[0];
  const tipo = tipoElegido ?? tipoDeDia(new Date(), feriados.datos ?? []);
  // Los horarios se muestran en la cabecera (primera parada) del sentido elegido.
  const cabecera = recorrido?.paradaIds[0];
  const nombreCabecera = paradas.datos?.find((p) => p.id === cabecera)?.nombre;

  const horarios = useCarga(
    useCallback(() => (cabecera ? horariosDeParada(id, cabecera, tipo) : responder<Horario[]>([])), [id, cabecera, tipo]),
  );

  // Paradas del sentido elegido, en el orden de paso.
  const paradasDelRecorrido = (recorrido?.paradaIds ?? [])
    .map((paradaId) => paradas.datos?.find((p) => p.id === paradaId))
    .filter((p) => p !== undefined);
  const abrirParada = (paradaId: string) => router.push({ pathname: '/parada/[id]', params: { id: paradaId } });

  const titulo = linea.datos ? `Línea ${linea.datos.numero}` : 'Línea';

  return (
    <Pantalla>
      <Stack.Screen
        options={{
          title: titulo,
          headerRight: () => <BotonFavorito activo={favoritos.esLineaFavorita(id)} onPress={() => favoritos.alternarLinea(id)} />,
        }}
      />

      {/* El aviso va arriba de todo: si la línea tiene desvío, es lo primero que se ve. */}
      {avisos.datos?.map((a) => (
        <TarjetaAvisoRed key={a.id} aviso={a} onPress={() => router.push({ pathname: '/aviso/[id]', params: { id: a.id } })} />
      ))}

      {linea.cargando ? (
        <EsqueletoLista variante="linea" cantidad={1} />
      ) : linea.error ? (
        <ErrorReintentar error={linea.error} onReintentar={linea.recargar} />
      ) : (
        linea.datos && (
          <>
            <Seccion titulo={linea.datos.nombre} descripcion={linea.datos.empresa}>
              {recorridos.length > 1 && (
                <Segmentos
                  opciones={recorridos.map((r) => ({ valor: r.sentido, texto: r.sentido === 'ida' ? 'Ida' : 'Vuelta' }))}
                  valor={recorrido?.sentido ?? 'ida'}
                  onCambiar={setSentido}
                />
              )}
              {recorrido && <Texto variante="destacado">{recorrido.destino}</Texto>}
            </Seccion>

            {recorrido && (
              <MapaRecorrido
                trazado={recorrido.trazado}
                color={linea.datos.color}
                paradas={paradasDelRecorrido}
                onParada={abrirParada}
                etiqueta={`Recorrido de la línea ${linea.datos.numero} ${recorrido.destino}`}
              />
            )}

            <Seccion titulo="Paradas" descripcion="En el orden en que pasa el colectivo">
              {paradas.cargando ? (
                <EsqueletoLista variante="parada" cantidad={3} />
              ) : paradas.error ? (
                <ErrorReintentar error={paradas.error} onReintentar={paradas.recargar} />
              ) : paradasDelRecorrido.length ? (
                <RecorridoTimeline
                  paradas={paradasDelRecorrido}
                  color={linea.datos.color}
                  esFavorita={favoritos.esParadaFavorita}
                  onPress={abrirParada}
                />
              ) : (
                <EstadoVacio icono="location-outline" titulo="Este recorrido no tiene paradas cargadas" />
              )}
            </Seccion>

            <Seccion titulo="Horarios" descripcion={nombreCabecera ? `Salidas desde ${nombreCabecera}, según la tabla` : 'Según la tabla'}>
              <Segmentos opciones={tiposDeDia.map((t) => ({ valor: t, texto: etiquetaTipoDeDia(t) }))} valor={tipo} onCambiar={setTipo} />
              {horarios.cargando ? (
                <EsqueletoLista variante="horario" cantidad={1} />
              ) : horarios.error ? (
                <ErrorReintentar error={horarios.error} onReintentar={horarios.recargar} />
              ) : horarios.datos?.length ? (
                <GrillaHoras horas={horarios.datos.map((h) => h.hora)} />
              ) : (
                <EstadoVacio icono="moon-outline" titulo={`Sin servicio los ${etiquetaTipoDeDia(tipo).toLowerCase()}`} />
              )}
            </Seccion>
          </>
        )
      )}
    </Pantalla>
  );
}
