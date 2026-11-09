import { router } from 'expo-router';

import { EsqueletoLista } from '@/componentes/Esqueleto/Esqueleto';
import { EstadoVacio, ErrorReintentar } from '@/componentes/Estados/Estados';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { estadoDeLinea, TarjetaLineaRed } from '@/componentes/Red/Red';
import { useCarga } from '@/hooks/useCarga';
import { useFavoritos } from '@/hooks/useFavoritos';
import { listarAvisosRed, listarLineasRed } from '@/servicios/red';

export default function Lineas() {
  const { datos, error, cargando, recargar } = useCarga(listarLineasRed);
  const avisos = useCarga(listarAvisosRed);
  const favoritos = useFavoritos();

  const estadoDe = (lineaId: string) => estadoDeLinea((avisos.datos ?? []).filter((a) => a.lineaIds.includes(lineaId)).map((a) => a.gravedad));
  // Las favoritas primero; el resto en el orden de la API (por número).
  const ordenadas = [...(datos ?? [])].sort((a, b) => Number(favoritos.esLineaFavorita(b.id)) - Number(favoritos.esLineaFavorita(a.id)));

  return (
    <Pantalla conTabs>
      <Seccion titulo="Todas las líneas" descripcion="Estado del servicio según los avisos vigentes">
        {cargando ? (
          <EsqueletoLista variante="linea" cantidad={5} />
        ) : error ? (
          <ErrorReintentar error={error} onReintentar={recargar} />
        ) : ordenadas.length ? (
          ordenadas.map((l) => (
            <TarjetaLineaRed
              key={l.id}
              linea={l}
              estado={estadoDe(l.id)}
              favorita={favoritos.esLineaFavorita(l.id)}
              onPress={() => router.push({ pathname: '/linea/[id]', params: { id: l.id } })}
            />
          ))
        ) : (
          <EstadoVacio icono="bus-outline" titulo="No hay líneas cargadas" mensaje="Actualiza los datos desde Ajustes cuando tengas conexión." />
        )}
      </Seccion>
    </Pantalla>
  );
}
