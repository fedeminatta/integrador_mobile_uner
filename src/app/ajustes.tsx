import { Platform } from 'react-native';

import { Boton } from '@/componentes/Boton/Boton';
import { FilaInterruptor, FilaOpcion } from '@/componentes/Filas/Filas';
import { NombreIcono } from '@/componentes/Icono/Icono';
import { Notificacion } from '@/componentes/Notificacion/Notificacion';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { Tarjeta } from '@/componentes/Tarjeta/Tarjeta';
import { useHaptica } from '@/hooks/useHaptica';
import { ModoTema, usePreferencias } from '@/hooks/usePreferencias';

const opcionesTema: { modo: ModoTema; titulo: string; descripcion: string; icono: NombreIcono }[] = [
  { modo: 'sistema', titulo: 'Igual que el teléfono', descripcion: 'Cambia solo con el modo del sistema', icono: 'phone-portrait-outline' },
  { modo: 'claro', titulo: 'Claro', descripcion: 'Fondo blanco, ideal de día', icono: 'sunny-outline' },
  { modo: 'oscuro', titulo: 'Oscuro', descripcion: 'Fondo azul noche, cansa menos la vista', icono: 'moon-outline' },
];

export default function Ajustes() {
  const { modoTema, cambiarModoTema, haptica, cambiarHaptica } = usePreferencias();
  const vibrar = useHaptica();
  const esWeb = Platform.OS === 'web';

  return (
    <Pantalla>
      <Seccion titulo="Apariencia">
        <Tarjeta sinRelleno>
          {opcionesTema.map((o, i) => (
            <FilaOpcion
              key={o.modo}
              titulo={o.titulo}
              descripcion={o.descripcion}
              icono={o.icono}
              conDivisor={i > 0}
              activa={modoTema === o.modo}
              onElegir={() => cambiarModoTema(o.modo)}
            />
          ))}
        </Tarjeta>
      </Seccion>

      <Seccion titulo="Vibración">
        <Tarjeta sinRelleno>
          <FilaInterruptor
            titulo="Vibrar al tocar y confirmar"
            descripcion="Una vibración corta al usar botones y al enviar un reporte"
            icono="phone-portrait-outline"
            valor={haptica}
            onCambiar={cambiarHaptica}
          />
        </Tarjeta>
        {esWeb ? (
          <Notificacion tipo="info" titulo="La vibración no funciona en el navegador" mensaje="Pruébala desde la app en el teléfono." />
        ) : (
          <Boton texto="Probar vibración" variante="secundario" icono="pulse-outline" deshabilitado={!haptica} onPress={vibrar.exito} />
        )}
      </Seccion>
    </Pantalla>
  );
}
