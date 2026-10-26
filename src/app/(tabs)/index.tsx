import { useState } from 'react';

import { Acordeon, ItemAcordeon } from '@/componentes/Acordeon/Acordeon';
import { Boton } from '@/componentes/Boton/Boton';
import { Dialogo } from '@/componentes/Dialogo/Dialogo';
import { EsqueletoLista } from '@/componentes/Esqueleto/Esqueleto';
import { EstadoVacio, ErrorReintentar } from '@/componentes/Estados/Estados';
import { Notificacion } from '@/componentes/Notificacion/Notificacion';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { TarjetaHorario } from '@/componentes/Tarjetas/Tarjetas';
import { Texto } from '@/componentes/Texto/Texto';
import { useCarga } from '@/hooks/useCarga';
import { useHaptica } from '@/hooks/useHaptica';
import { listarAvisos } from '@/servicios/avisos';
import { proximosEnParada } from '@/servicios/horarios';
import { rangoDeFechas } from '@/utils/fechas';

// Por ahora la parada favorita es fija; después sale de los favoritos del usuario.
const PARADA_FAVORITA = 'p1';
const pedirProximos = () => proximosEnParada(PARADA_FAVORITA);

export default function Inicio() {
  const haptica = useHaptica();
  const avisos = useCarga(listarAvisos);
  const proximos = useCarga(pedirProximos);
  const [dialogo, setDialogo] = useState(false);
  const [reportado, setReportado] = useState(false);
  const [avisoCerrado, setAvisoCerrado] = useState(false);

  const destacado = avisos.datos?.[0];
  const primero = proximos.datos?.[0];

  const confirmarReporte = () => {
    setDialogo(false);
    setReportado(true);
    haptica.exito();
  };

  return (
    <Pantalla conTabs>
      {avisos.cargando ? (
        <EsqueletoLista variante="notificacion" cantidad={1} />
      ) : (
        destacado &&
        !avisoCerrado && (
          <Notificacion
            tipo="aviso"
            titulo={destacado.titulo}
            mensaje={rangoDeFechas(destacado.desde, destacado.hasta)}
            onCerrar={() => setAvisoCerrado(true)}
          />
        )
      )}

      {reportado && (
        <Notificacion
          tipo="exito"
          titulo="Reporte guardado"
          mensaje="Lo enviamos apenas haya conexión. Gracias por avisar."
          onCerrar={() => setReportado(false)}
        />
      )}

      <Seccion titulo="Próximos en tu parada" descripcion="Urquiza y 25 de Mayo · horarios de la tabla">
        {proximos.cargando ? (
          <EsqueletoLista variante="horario" cantidad={3} />
        ) : proximos.error ? (
          <ErrorReintentar error={proximos.error} onReintentar={proximos.recargar} />
        ) : proximos.datos?.length ? (
          proximos.datos.map((h) => <TarjetaHorario key={h.id} horario={h} />)
        ) : (
          <EstadoVacio icono="moon-outline" titulo="No hay más colectivos hoy" mensaje="El servicio de esta parada terminó. Mira la tabla de mañana." />
        )}
        {primero && <Boton texto="Reportar demora en esta parada" variante="secundario" icono="time-outline" onPress={() => setDialogo(true)} />}
      </Seccion>

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
              </ItemAcordeon>
            ))}
          </Acordeon>
        ) : (
          <EstadoVacio icono="checkmark-done-outline" titulo="Sin avisos" mensaje="Todas las líneas funcionan normalmente." />
        )}
      </Seccion>

      <Dialogo
        visible={dialogo}
        titulo="¿Reportar una demora?"
        mensaje={
          primero
            ? `Línea ${primero.numeroLinea} en ${primero.nombreParada}. Según la tabla pasaba a las ${primero.hora}.`
            : undefined
        }
        icono="time"
        onCerrar={() => setDialogo(false)}
        acciones={[
          { texto: 'Sí, reportar la demora', onPress: confirmarReporte },
          { texto: 'Cancelar', variante: 'texto', onPress: () => setDialogo(false) },
        ]}
      />
    </Pantalla>
  );
}
