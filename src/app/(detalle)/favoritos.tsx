import { router, Stack } from 'expo-router';

import { EsqueletoLista } from '@/componentes/Esqueleto/Esqueleto';
import { EstadoVacio, ErrorReintentar } from '@/componentes/Estados/Estados';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { estadoDeLinea, TarjetaLineaRed, TarjetaParadaRed } from '@/componentes/Red/Red';
import { useCarga } from '@/hooks/useCarga';
import { useFavoritos } from '@/hooks/useFavoritos';
import { buscarParadas, listarAvisosRed, listarLineasRed } from '@/servicios/red';

const todasLasParadas = () => buscarParadas('');

export default function Favoritos() {
  const favoritos = useFavoritos();
  const lineas = useCarga(listarLineasRed);
  const paradas = useCarga(todasLasParadas);
  const avisos = useCarga(listarAvisosRed);

  // En el orden en que se marcaron.
  const lineasFavoritas = favoritos.lineas.map((id) => lineas.datos?.find((l) => l.id === id)).filter((l) => l !== undefined);
  const paradasFavoritas = favoritos.paradas.map((id) => paradas.datos?.find((p) => p.id === id)).filter((p) => p !== undefined);
  const estadoDe = (lineaId: string) => estadoDeLinea((avisos.datos ?? []).filter((a) => a.lineaIds.includes(lineaId)).map((a) => a.gravedad));
  const numerosDe = (lineaIds: string[]) => (lineas.datos ?? []).filter((l) => lineaIds.includes(l.id)).map((l) => l.numero);

  return (
    <Pantalla>
      <Stack.Screen options={{ title: 'Favoritos' }} />

      <Seccion titulo="Paradas" descripcion="Toca la estrella en una parada para guardarla acá">
        {paradas.cargando ? (
          <EsqueletoLista variante="parada" cantidad={2} />
        ) : paradas.error ? (
          <ErrorReintentar error={paradas.error} onReintentar={paradas.recargar} />
        ) : paradasFavoritas.length ? (
          paradasFavoritas.map((p) => (
            <TarjetaParadaRed
              key={p.id}
              parada={p}
              numerosLinea={numerosDe(p.lineaIds)}
              favorita
              onPress={() => router.push({ pathname: '/parada/[id]', params: { id: p.id } })}
            />
          ))
        ) : (
          <EstadoVacio icono="star-outline" titulo="Todavía no guardaste paradas" mensaje="Las paradas favoritas aparecen primero en el inicio." />
        )}
      </Seccion>

      <Seccion titulo="Líneas">
        {lineas.cargando ? (
          <EsqueletoLista variante="linea" cantidad={2} />
        ) : lineas.error ? (
          <ErrorReintentar error={lineas.error} onReintentar={lineas.recargar} />
        ) : lineasFavoritas.length ? (
          lineasFavoritas.map((l) => (
            <TarjetaLineaRed key={l.id} linea={l} estado={estadoDe(l.id)} favorita onPress={() => router.push({ pathname: '/linea/[id]', params: { id: l.id } })} />
          ))
        ) : (
          <EstadoVacio icono="star-outline" titulo="Todavía no guardaste líneas" mensaje="Entra a una línea y toca la estrella de arriba." />
        )}
      </Seccion>
    </Pantalla>
  );
}
