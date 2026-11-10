import { router, Stack } from 'expo-router';
import { useState } from 'react';

import { CampoTexto } from '@/componentes/CampoTexto/CampoTexto';
import { EsqueletoLista } from '@/componentes/Esqueleto/Esqueleto';
import { EstadoVacio, ErrorReintentar } from '@/componentes/Estados/Estados';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { TarjetaLineaRed, TarjetaParadaRed } from '@/componentes/Red/Red';
import { useCarga } from '@/hooks/useCarga';
import { useFavoritos } from '@/hooks/useFavoritos';
import { buscarParadas, listarLineasRed } from '@/servicios/red';

const todasLasParadas = () => buscarParadas('');

// Sin tildes ni mayúsculas: "almafuerte" encuentra "Almafuerte y Newbery".
const normal = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Una sola búsqueda que encuentra líneas (por número o nombre) y paradas (por nombre o calle).
export default function Buscar() {
  const [texto, setTexto] = useState('');
  const lineas = useCarga(listarLineasRed);
  const paradas = useCarga(todasLasParadas);
  const favoritos = useFavoritos();

  const termino = normal(texto.trim());
  const numeros = new Map((lineas.datos ?? []).map((l) => [l.id, l.numero]));
  const lineasEncontradas = termino ? (lineas.datos ?? []).filter((l) => l.numero === termino || normal(l.nombre).includes(termino)) : [];
  const paradasEncontradas = termino ? (paradas.datos ?? []).filter((p) => normal(p.nombre).includes(termino)) : [];
  const cargando = lineas.cargando || paradas.cargando;
  const error = lineas.error ?? paradas.error;

  return (
    <Pantalla>
      <Stack.Screen options={{ title: 'Buscar' }} />
      <CampoTexto etiqueta="Línea o parada" tipo="busqueda" valor={texto} onCambiar={setTexto} placeholder="Por ejemplo: 5, Alameda, Terminal" />

      {cargando ? (
        <EsqueletoLista variante="linea" cantidad={3} />
      ) : error ? (
        <ErrorReintentar
          error={error}
          onReintentar={() => {
            lineas.recargar();
            paradas.recargar();
          }}
        />
      ) : !termino ? (
        <EstadoVacio icono="search-outline" titulo="Escribe un número de línea, una calle o una esquina" />
      ) : !lineasEncontradas.length && !paradasEncontradas.length ? (
        <EstadoVacio icono="search-outline" titulo={`No encontramos "${texto.trim()}"`} mensaje="Prueba con otra calle o con el número de la línea." />
      ) : (
        <>
          {lineasEncontradas.length > 0 && (
            <Seccion titulo="Líneas">
              {lineasEncontradas.map((l) => (
                <TarjetaLineaRed
                  key={l.id}
                  linea={l}
                  estado="normal"
                  favorita={favoritos.esLineaFavorita(l.id)}
                  onPress={() => router.push({ pathname: '/linea/[id]', params: { id: l.id } })}
                />
              ))}
            </Seccion>
          )}
          {paradasEncontradas.length > 0 && (
            <Seccion titulo="Paradas">
              {paradasEncontradas.map((p) => (
                <TarjetaParadaRed
                  key={p.id}
                  parada={p}
                  numerosLinea={p.lineaIds.map((id) => numeros.get(id) ?? '?')}
                  favorita={favoritos.esParadaFavorita(p.id)}
                  onPress={() => router.push({ pathname: '/parada/[id]', params: { id: p.id } })}
                />
              ))}
            </Seccion>
          )}
        </>
      )}
    </Pantalla>
  );
}
