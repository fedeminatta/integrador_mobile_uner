import { Notificacion } from '@/componentes/Notificacion/Notificacion';
import { useRed } from '@/hooks/useRed';
import { haceCuanto } from '@/utils/tablas';

// Aparece arriba de cada pantalla cuando el teléfono no tiene conexión.
export function BannerConexion() {
  const { sinConexion, ultimaActualizacion } = useRed();
  if (!sinConexion) return null;
  const desde = ultimaActualizacion ? `Los datos son de ${haceCuanto(ultimaActualizacion, new Date())}. ` : '';
  return (
    <Notificacion
      tipo="info"
      titulo="Sin conexión"
      mensaje={`${desde}Los horarios guardados siguen andando; los avisos y reportes pueden no estar al día.`}
    />
  );
}
