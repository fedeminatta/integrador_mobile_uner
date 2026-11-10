import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';

import { EsqueletoLista } from '@/componentes/Esqueleto/Esqueleto';
import { ErrorReintentar } from '@/componentes/Estados/Estados';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { MapaRecorrido } from '@/componentes/Mapa/Mapa';
import { ChipGravedad, TarjetaLineaRed } from '@/componentes/Red/Red';
import { crearEstilos } from '@/componentes/Red/Red.estilos';
import { Tarjeta } from '@/componentes/Tarjeta/Tarjeta';
import { Texto } from '@/componentes/Texto/Texto';
import { useCarga } from '@/hooks/useCarga';
import { listarLineasRed, obtenerAviso } from '@/servicios/red';
import { useEstilos } from '@/tema';
import { rangoDeFechas } from '@/utils/fechas';

export default function DetalleAviso() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const e = useEstilos(crearEstilos);
  const aviso = useCarga(useCallback(() => obtenerAviso(id), [id]));
  const lineas = useCarga(listarLineasRed);

  const afectadas = (lineas.datos ?? []).filter((l) => aviso.datos?.lineaIds.includes(l.id));

  return (
    <Pantalla>
      <Stack.Screen options={{ title: 'Aviso' }} />

      {aviso.cargando ? (
        <EsqueletoLista variante="aviso" cantidad={1} />
      ) : aviso.error ? (
        <ErrorReintentar error={aviso.error} onReintentar={aviso.recargar} />
      ) : (
        aviso.datos && (
          <>
            <Tarjeta>
              <View style={e.fila}>
                <ChipGravedad gravedad={aviso.datos.gravedad} />
                <Texto variante="etiqueta">{rangoDeFechas(aviso.datos.desde, aviso.datos.hasta)}</Texto>
              </View>
              <Texto variante="subtitulo">{aviso.datos.titulo}</Texto>
              <Texto>{aviso.datos.detalle}</Texto>
            </Tarjeta>

            {/* El video del desvío (expo-video, con controles a la vista) va en esta sección cuando aviso.videoUrl no es null. */}
            {aviso.datos.trazadoAlternativo && (
              <Seccion titulo="Por dónde pasa ahora" descripcion="Punteado: recorrido del desvío. Línea llena: recorrido habitual.">
                <MapaRecorrido
                  trazado={afectadas[0]?.recorridos[0]?.trazado ?? []}
                  color={afectadas[0]?.color ?? '#04295a'}
                  alternativo={aviso.datos.trazadoAlternativo}
                  etiqueta={`Recorrido alternativo: ${aviso.datos.titulo}`}
                />
              </Seccion>
            )}

            <Seccion titulo="Líneas afectadas">
              {lineas.cargando ? (
                <EsqueletoLista variante="linea" cantidad={aviso.datos.lineaIds.length} />
              ) : (
                afectadas.map((l) => (
                  <TarjetaLineaRed
                    key={l.id}
                    linea={l}
                    estado={aviso.datos!.gravedad === 'informativo' ? 'normal' : aviso.datos!.gravedad}
                    onPress={() => router.push({ pathname: '/linea/[id]', params: { id: l.id } })}
                  />
                ))
              )}
            </Seccion>
          </>
        )
      )}
    </Pantalla>
  );
}
