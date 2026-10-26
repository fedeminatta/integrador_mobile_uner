import { EsqueletoLista } from '@/componentes/Esqueleto/Esqueleto';
import { EstadoVacio, ErrorReintentar } from '@/componentes/Estados/Estados';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { TarjetaLinea } from '@/componentes/Tarjetas/Tarjetas';
import { useCarga } from '@/hooks/useCarga';
import { listarLineas } from '@/servicios/lineas';

export default function Lineas() {
  const { datos, error, cargando, recargar } = useCarga(listarLineas);

  return (
    <Pantalla conTabs>
      <Seccion titulo="Todas las líneas" descripcion="Estado del servicio según los avisos vigentes">
        {cargando ? (
          <EsqueletoLista variante="linea" cantidad={5} />
        ) : error ? (
          <ErrorReintentar error={error} onReintentar={recargar} />
        ) : datos?.length ? (
          datos.map((l) => <TarjetaLinea key={l.id} linea={l} />)
        ) : (
          <EstadoVacio icono="bus-outline" titulo="No hay líneas cargadas" mensaje="Actualiza los datos desde Ajustes cuando tengas conexión." />
        )}
      </Seccion>
    </Pantalla>
  );
}
