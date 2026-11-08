import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

import { Boton } from '@/componentes/Boton/Boton';
import { CampoTexto } from '@/componentes/CampoTexto/CampoTexto';
import { EsqueletoLista } from '@/componentes/Esqueleto/Esqueleto';
import { EstadoVacio, ErrorReintentar } from '@/componentes/Estados/Estados';
import { MapaParadas } from '@/componentes/MapaParadas/MapaParadas';
import { Notificacion } from '@/componentes/Notificacion/Notificacion';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { TarjetaParada } from '@/componentes/Tarjetas/Tarjetas';
import { useHaptica } from '@/hooks/useHaptica';
import { usePermisos } from '@/hooks/usePermisos';
import { listarLineasReales, listarParadasReales, ParadaVista } from '@/servicios/paradasApi';
import { ErrorApi } from '@/tipos';
import type { Coordenadas } from '@/tipos/types';
import { metrosEntre } from '@/utils/distancia';
import { FlechaRumbo } from '@/componentes/FlechaRumbo/FlechaRumbo';
import { View } from 'react-native';

export default function Paradas() {
  const { estados, pedir, abrirAjustes } = usePermisos();
  const haptica = useHaptica();

  const [paradas, setParadas] = useState<ParadaVista[] | null>(null);
  const [error, setError] = useState<ErrorApi | null>(null);
  const [cargando, setCargando] = useState(true);
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionada, setSeleccionada] = useState<string | null>(null);

  const conPermiso = estados.ubicacion === 'concedido';

  const cargar = (vivo: () => boolean) =>
  (async () => {
    const [rParadas, rLineas] = await Promise.all([listarParadasReales(), listarLineasReales()]);
    if (!vivo()) return;
    if ('error' in rParadas) { setError(rParadas.error); setCargando(false); return; }
    if ('error' in rLineas) { setError(rLineas.error); setCargando(false); return; }
    const numeros = new Map(rLineas.datos.map((l) => [l.id, l.numero]));
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
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!vivo) return;
        setUbicacion({ latitud: loc.coords.latitude, longitud: loc.coords.longitude });
      } catch {
        
      }
    })();
    return () => {
      vivo = false;
    };
  }, [estados.ubicacion]);

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
        !termino ||
        p.nombre.toLowerCase().includes(termino) ||
        p.numerosLinea.some((n) => n.includes(termino)),
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
    <Pantalla conTabs>
      <CampoTexto
        etiqueta="Buscar parada"
        tipo="busqueda"
        valor={busqueda}
        onCambiar={setBusqueda}
        placeholder="Calle, esquina o número de línea"
      />
      <MapaParadas
        paradas={filtradas}
        conUbicacion={conPermiso}
        seleccionada={seleccionada}
        onSeleccionar={seleccionar}
      />
      <Seccion
        titulo="Paradas"
        descripcion={
          ubicacion
            ? 'Ordenadas por distancia a tu ubicación'
            : 'Sin permiso de ubicación se listan por nombre'
        }>
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
            <TarjetaParada key={p.id} parada={p} seleccionada={seleccionada === p.id} />
          ))
        ) : (
          <EstadoVacio
            icono="search-outline"
            titulo={termino ? `No hay paradas con "${busqueda.trim()}"` : 'No hay paradas cargadas'}
            mensaje={termino ? 'Prueba con otra calle o con el número de la línea.' : undefined}
          />
        )}
      </Seccion>
      <View style={{ marginTop: 20 }}>
        <FlechaRumbo
          latUsuario={-31.7333}
          lonUsuario={-60.5241}
          latParada={-31.7321}
          lonParada={-60.5229}
        />
      </View>
    </Pantalla>
    
  );
}