import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { Boton } from '@/componentes/Boton/Boton';
import { EsqueletoLista } from '@/componentes/Esqueleto/Esqueleto';
import { EstadoVacio, ErrorReintentar } from '@/componentes/Estados/Estados';
import { Notificacion } from '@/componentes/Notificacion/Notificacion';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { TarjetaAviso } from '@/componentes/Tarjetas/Tarjetas';
import { useAvisos } from '@/hooks/useAvisos';
import { EstadoPermiso, usePermisos } from '@/hooks/usePermisos';
import {
  avisarAvisosNuevos,
  pedirPermisoNotificaciones,
  permisoNotificaciones,
} from '@/servicios/notificaciones';

export default function Avisos() {
  const { datos, error, cargando, recargar } = useAvisos();
  const { abrirAjustes } = usePermisos();
  const [permiso, setPermiso] = useState<EstadoPermiso | null>(null);

  
 useFocusEffect(
  useCallback(() => {
    let vivo = true; 
    (async () => {
      const e = await permisoNotificaciones();
      if (vivo) setPermiso(e);
    })();
    return () => { vivo = false; }; 
  }, [])
);

  const activar = async () => {
    const e = await pedirPermisoNotificaciones();
    setPermiso(e);
    if (e === 'concedido' && datos) await avisarAvisosNuevos(datos);
  };

  return (
    <Pantalla conTabs>
      {permiso === 'sin-determinar' && (
        <>
          <Notificacion
            tipo="info"
            titulo="Enterate de avisos nuevos"
            mensaje="Activá las notificaciones y te avisamos cuando haya un desvío o corte."
          />
          <Boton texto="Activar notificaciones" icono="notifications-outline" onPress={activar} />
        </>
      )}
      {permiso === 'denegado' && (
        <>
          <Notificacion
            tipo="info"
            titulo="Notificaciones desactivadas"
            mensaje="Sin permiso no podemos avisarte de avisos nuevos."
          />
          <Boton texto="Intentar de nuevo" variante="texto" icono="refresh" onPress={activar} />
        </>
      )}
      {permiso === 'bloqueado' && (
        <>
          <Notificacion
            tipo="info"
            titulo="Permiso de notificaciones bloqueado"
            mensaje="Abrí Ajustes para activarlo."
          />
          <Boton texto="Abrir ajustes" variante="texto" icono="settings" onPress={abrirAjustes} />
        </>
      )}

      <Seccion titulo="Avisos vigentes" descripcion="Desvíos, cortes y cambios de horario">
        {cargando ? (
          <EsqueletoLista variante="aviso" cantidad={2} />
        ) : error ? (
          <ErrorReintentar error={error} onReintentar={recargar} />
        ) : datos?.length ? (
          datos.map((a) => (
            <TarjetaAviso key={a.id} aviso={a} onPress={() => router.push({ pathname: '/aviso/[id]', params: { id: a.id } })} />
          ))
        ) : (
          <EstadoVacio
            icono="checkmark-done-outline"
            titulo="Sin avisos"
            mensaje="Todas las líneas funcionan normalmente."
          />
        )}
      </Seccion>
    </Pantalla>
  );
}