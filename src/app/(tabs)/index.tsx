import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Acordeon, ItemAcordeon } from '@/componentes/Acordeon/Acordeon';
import { Boton } from '@/componentes/Boton/Boton';
import { EsqueletoLista } from '@/componentes/Esqueleto/Esqueleto';
import { EstadoVacio, ErrorReintentar } from '@/componentes/Estados/Estados';
import { Icono } from '@/componentes/Icono/Icono';
import { Notificacion } from '@/componentes/Notificacion/Notificacion';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { MapaParadas } from '@/componentes/MapaParadas/MapaParadas';
import { ParadaConProximos } from '@/componentes/Red/ParadaConProximos';
import { estadoDeLinea, TarjetaLineaRed, TarjetaParadaRed } from '@/componentes/Red/Red';
import { Texto } from '@/componentes/Texto/Texto';
import { useAvisos } from '@/hooks/useAvisos';
import { useCarga } from '@/hooks/useCarga';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useLugar } from '@/hooks/useLugar';
import { useRecientes } from '@/hooks/useRecientes';
import { useUbicacion } from '@/hooks/useUbicacion';
import { buscarParadas, listarFeriados, listarLineasRed } from '@/servicios/red';
import { useEstilos } from '@/tema';
import { crearEstilos } from '@/componentes/Red/Red.estilos';
import { rangoDeFechas } from '@/utils/fechas';
import { etiquetaTipoDeDia, tipoDeDia } from '@/utils/tablas';

const todasLasParadas = () => buscarParadas('');

// Inicio: primero lo que la persona guardó (paradas y líneas favoritas), después los avisos de hoy.
export default function Inicio() {
  const avisos = useAvisos();
  const lineas = useCarga(listarLineasRed);
  const favoritos = useFavoritos();
  const { lugar, concedido, puedePedir, pedirPermiso } = useLugar();
  const e = useEstilos(crearEstilos);
  const [avisoCerrado, setAvisoCerrado] = useState(false);
  const paradas = useCarga(todasLasParadas);
  const feriados = useCarga(listarFeriados);
  const { recientes } = useRecientes();
  const ubicacion = useUbicacion();

  // Fines de semana y feriados rigen otras tablas: se avisa arriba de todo.
  const tipoHoy = tipoDeDia(new Date(), feriados.datos ?? []);
  // Recientes que no son favoritas (las favoritas ya se muestran arriba).
  const paradasRecientes = recientes
    .filter((id) => !favoritos.esParadaFavorita(id))
    .map((id) => paradas.datos?.find((p) => p.id === id))
    .filter((p) => p !== undefined);
  const abrirParada = (id: string) => router.push({ pathname: '/parada/[id]', params: { id } });

  const destacado = avisos.datos?.[0];
  const numeros = new Map((lineas.datos ?? []).map((l) => [l.id, l.numero]));
  const lineasFavoritas = favoritos.lineas.map((id) => lineas.datos?.find((l) => l.id === id)).filter((l) => l !== undefined);
  const estadoDe = (lineaId: string) => estadoDeLinea((avisos.datos ?? []).filter((a) => a.lineaIds.includes(lineaId)).map((a) => a.gravedad));
  const sinFavoritos = !favoritos.paradas.length && !favoritos.lineas.length;

  return (
    <Pantalla conTabs>
      {/* Dónde está la persona (provincia - localidad); sin permiso se ofrece activarlo. */}
      {lugar ? (
        <View style={e.fila} accessibilityLabel={`Estás en ${lugar}`}>
          <Icono nombre="location" tamano={20} color="enlace" />
          <Texto variante="destacado">{lugar}</Texto>
        </View>
      ) : (
        !concedido &&
        puedePedir && <Boton texto="Mostrar dónde estoy" variante="texto" icono="location-outline" onPress={pedirPermiso} />
      )}

      {tipoHoy !== 'habil' && feriados.datos && (
        <Notificacion
          tipo="info"
          titulo={`Hoy rige el horario de ${etiquetaTipoDeDia(tipoHoy).toLowerCase()}`}
          mensaje="Los colectivos pasan con menos frecuencia que un día hábil."
        />
      )}

      {destacado && !avisoCerrado && (
        <Notificacion tipo="aviso" titulo={destacado.titulo} mensaje={rangoDeFechas(destacado.desde, destacado.hasta)} onCerrar={() => setAvisoCerrado(true)} />
      )}

      {sinFavoritos ? (
        <Seccion titulo="Tus paradas">
          <EstadoVacio
            icono="star-outline"
            titulo="Todavía no guardaste paradas"
            mensaje="Busca la parada donde tomas el colectivo y toca la estrella: va a aparecer acá con sus próximos horarios."
          />
          <Boton texto="Buscar una parada" icono="search" onPress={() => router.navigate('/paradas')} />
        </Seccion>
      ) : (
        <>
          {favoritos.paradas.length > 0 && (
            <Seccion titulo="Tus paradas" descripcion="Próximos colectivos según la tabla">
              {favoritos.paradas.map((id) => (
                <ParadaConProximos key={id} paradaId={id} numeros={numeros} onPress={() => abrirParada(id)} />
              ))}
            </Seccion>
          )}
          {favoritos.lineas.length > 0 && (
            <Seccion titulo="Tus líneas">
              {lineas.cargando ? (
                <EsqueletoLista variante="linea" cantidad={favoritos.lineas.length} />
              ) : (
                lineasFavoritas.map((l) => (
                  <TarjetaLineaRed
                    key={l.id}
                    linea={l}
                    estado={estadoDe(l.id)}
                    favorita
                    onPress={() => router.push({ pathname: '/linea/[id]', params: { id: l.id } })}
                  />
                ))
              )}
            </Seccion>
          )}
        </>
      )}

      {paradasRecientes.length > 0 && (
        <Seccion titulo="Vistas hace poco">
          {paradasRecientes.map((p) => (
            <TarjetaParadaRed
              key={p.id}
              parada={p}
              numerosLinea={p.lineaIds.map((id) => numeros.get(id) ?? '?')}
              onPress={() => abrirParada(p.id)}
            />
          ))}
        </Seccion>
      )}

      <Seccion titulo="Avisos de hoy">
        {avisos.cargando ? (
          <EsqueletoLista variante="acordeon" cantidad={1} />
        ) : avisos.error ? (
          <ErrorReintentar error={avisos.error} onReintentar={avisos.recargar} />
        ) : avisos.datos?.length ? (
          <Acordeon>
            {avisos.datos.map((a, i) => (
              <ItemAcordeon key={a.id} titulo={a.titulo} icono="megaphone-outline" abiertoAlInicio={i === 0}>
                <Texto>{a.detalle}</Texto>
                <Texto variante="etiqueta">{rangoDeFechas(a.desde, a.hasta)}</Texto>
                <Boton texto="Ver el aviso" variante="texto" icono="arrow-forward" onPress={() => router.push({ pathname: '/aviso/[id]', params: { id: a.id } })} />
              </ItemAcordeon>
            ))}
          </Acordeon>
        ) : (
          <EstadoVacio icono="checkmark-done-outline" titulo="Sin avisos" mensaje="Todas las líneas funcionan normalmente." />
        )}
      </Seccion>

      <Seccion titulo="Mapa de paradas" descripcion="Toca una parada y después su nombre para ver los horarios">
        <MapaParadas
          paradas={paradas.datos ?? []}
          conUbicacion={concedido}
          centro={ubicacion}
          seleccionada={null}
          onSeleccionar={() => {}}
          onAbrir={abrirParada}
          alto={260}
        />
      </Seccion>
    </Pantalla>
  );
}
