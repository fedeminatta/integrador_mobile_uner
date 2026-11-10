import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { Boton } from '@/componentes/Boton/Boton';
import { CampoTexto } from '@/componentes/CampoTexto/CampoTexto';
import { Cargando } from '@/componentes/Cargando/Cargando';
import { EsqueletoLista } from '@/componentes/Esqueleto/Esqueleto';
import { EstadoVacio, ErrorReintentar } from '@/componentes/Estados/Estados';
import { MapaParadas } from '@/componentes/MapaParadas/MapaParadas';
import { ChipsLineas } from '@/componentes/Red/Red';
import { Notificacion } from '@/componentes/Notificacion/Notificacion';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { TarjetaParada } from '@/componentes/Tarjetas/Tarjetas';
import { useHaptica } from '@/hooks/useHaptica';
import { usePermisos } from '@/hooks/usePermisos';
import { ParadaVista } from '@/servicios/paradasApi';
import { buscarParadas, listarLineasRed } from '@/servicios/red';
import { ErrorApi } from '@/tipos';
import type { Coordenadas, Linea } from '@/tipos/types';
import { metrosEntre } from '@/utils/distancia';

export default function Paradas() {
  const { estados, pedir, abrirAjustes } = usePermisos();
  const haptica = useHaptica();

  const [paradas, setParadas] = useState<ParadaVista[] | null>(null);
  const [error, setError] = useState<ErrorApi | null>(null);
  const [cargando, setCargando] = useState(true);
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [falloUbicacion, setFalloUbicacion] = useState(false);
  const [intentoUbicacion, setIntentoUbicacion] = useState(0);
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [lineaFiltro, setLineaFiltro] = useState<string | null>(null);

  const conPermiso = estados.ubicacion === 'concedido';

  const cargar = (vivo: () => boolean) =>
  (async () => {
    const [rParadas, rLineas] = await Promise.all([buscarParadas(''), listarLineasRed()]);
    if (!vivo()) return;
    if ('error' in rParadas) { setError(rParadas.error); setCargando(false); return; }
    if ('error' in rLineas) { setError(rLineas.error); setCargando(false); return; }
    const numeros = new Map(rLineas.datos.map((l) => [l.id, l.numero]));
    setLineas(rLineas.datos);
    setParadas(rParadas.datos.map((p) => ({ ...p, numerosLinea: p.lineaIds.map((id) => numeros.get(id) ?? id), distancia: null })));
    setError(null);
    setCargando(false);
  })();

  // useEffect de carga
  useEffect(() => {
    let vivo = true;
    cargar(() => vivo);
    return () => { vivo = false; };
  }, []);

  // Posición del usuario, solo cuando el permiso está concedido.
  useEffect(() => {
    if (estados.ubicacion !== 'concedido') return;
    let vivo = true;
    (async () => {
      setBuscandoUbicacion(true);
      setFalloUbicacion(false);
      try {
        // La última posición conocida llega al instante; después se pide la actual, más precisa.
        const ultima = await Location.getLastKnownPositionAsync();
        if (vivo && ultima) setUbicacion({ latitud: ultima.coords.latitude, longitud: ultima.coords.longitude });
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!vivo) return;
        setUbicacion({ latitud: loc.coords.latitude, longitud: loc.coords.longitude });
      } catch {
        // GPS apagado o sin señal: la lista sigue ordenada por nombre.
        if (vivo) setFalloUbicacion(true);
      } finally {
        if (vivo) setBuscandoUbicacion(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, [estados.ubicacion, intentoUbicacion]);

  const pedirUbicacion = async () => {
    const est = await pedir('ubicacion');
    haptica[est === 'concedido' ? 'exito' : 'error']();
  };

  const termino = busqueda.trim().toLowerCase();
  const vistas: ParadaVista[] = (paradas ?? []).map((p) => ({
    ...p,
    distancia: ubicacion ? Math.round(metrosEntre(ubicacion, p.coordenadas)) : null,
  }));
  const filtradas = vistas
    .filter(
      (p) =>
        (!lineaFiltro || p.lineaIds.includes(lineaFiltro)) &&
        (!termino ||
          p.nombre.toLowerCase().includes(termino) ||
          p.numerosLinea.some((n) => n.includes(termino))),
    )
    .sort((a, b) => {
      if (a.distancia != null && b.distancia != null) return a.distancia - b.distancia;
      return a.nombre.localeCompare(b.nombre);
    });

  const seleccionar = (id: string) => {
    haptica.toque();
    setSeleccionada(id);
  };

  return (
    <Pantalla
      conTabs
      onRefrescar={() => {
        setCargando(true);
        cargar(() => true);
      }}>
      <CampoTexto
        etiqueta="Buscar parada"
        tipo="busqueda"
        valor={busqueda}
        onCambiar={setBusqueda}
        placeholder="Calle, esquina o número de línea"
      />
      <ChipsLineas lineas={lineas} valor={lineaFiltro} onCambiar={setLineaFiltro} />
      <MapaParadas
        paradas={filtradas}
        conUbicacion={conPermiso}
        centro={ubicacion}
        seleccionada={seleccionada}
        onSeleccionar={seleccionar}
        onAbrir={(id) => router.push({ pathname: '/parada/[id]', params: { id } })}
      />
      <Seccion
        titulo="Paradas"
        descripcion={
          ubicacion
            ? 'Ordenadas por distancia a tu ubicación'
            : 'Sin permiso de ubicación se listan por nombre'
        }>
        {buscandoUbicacion && !ubicacion && <Cargando texto="Buscando tu ubicación" />}
        {falloUbicacion && !ubicacion && (
          <>
            <Notificacion
              tipo="info"
              titulo="No encontramos tu ubicación"
              mensaje="Revisa que la ubicación del teléfono esté activada. Mientras tanto, la lista se ordena por nombre."
            />
            <Boton texto="Intentar de nuevo" variante="texto" icono="refresh" onPress={() => setIntentoUbicacion((n) => n + 1)} />
          </>
        )}
        {estados.ubicacion === 'sin-determinar' && (
          <Boton
            texto="Usar mi ubicación"
            variante="secundario"
            icono="location-outline"
            onPress={pedirUbicacion}
          />
        )}
        {estados.ubicacion === 'denegado' && (
          <>
            <Notificacion
              tipo="info"
              titulo="Sin ubicación"
              mensaje="La lista se muestra ordenada por nombre."
            />
            <Boton texto="Intentar de nuevo" variante="texto" icono="refresh" onPress={pedirUbicacion} />
          </>
        )}
        {estados.ubicacion === 'bloqueado' && (
          <>
            <Notificacion
              tipo="info"
              titulo="Permiso de ubicación desactivado"
              mensaje="Abrí Ajustes para activarlo."
            />
            <Boton texto="Abrir ajustes" variante="texto" icono="settings" onPress={abrirAjustes} />
          </>
        )}
        {cargando ? (
          <EsqueletoLista variante="parada" cantidad={4} />
        ) : error ? (
          <ErrorReintentar error={error} onReintentar={() => { setCargando(true); cargar(() => true); }} />
        ) : filtradas.length ? (
          filtradas.map((p) => (
            <TarjetaParada
              key={p.id}
              parada={p}
              seleccionada={seleccionada === p.id}
              onPress={() => router.push({ pathname: '/parada/[id]', params: { id: p.id } })}
            />
          ))
        ) : (
          <EstadoVacio
            icono="search-outline"
            titulo={termino ? `No hay paradas con "${busqueda.trim()}"` : 'No hay paradas cargadas'}
            mensaje={termino ? 'Prueba con otra calle o con el número de la línea.' : undefined}
          />
        )}
      </Seccion>
    </Pantalla>
    
  );
}