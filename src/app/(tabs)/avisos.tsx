import { EsqueletoLista } from '@/componentes/Esqueleto/Esqueleto';
import { EstadoVacio, ErrorReintentar } from '@/componentes/Estados/Estados';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { TarjetaAviso } from '@/componentes/Tarjetas/Tarjetas';
import { useCarga } from '@/hooks/useCarga';
import { listarAvisos } from '@/servicios/avisos';

export default function Avisos() {
  const { datos, error, cargando, recargar } = useCarga(listarAvisos);

  return (
    <Pantalla conTabs>
      <Seccion titulo="Avisos vigentes" descripcion="Desvíos, cortes y cambios de horario">
        {cargando ? (
          <EsqueletoLista variante="aviso" cantidad={2} />
        ) : error ? (
          <ErrorReintentar error={error} onReintentar={recargar} />
        ) : datos?.length ? (
          datos.map((a) => <TarjetaAviso key={a.id} aviso={a} />)
        ) : (
          <EstadoVacio icono="checkmark-done-outline" titulo="Sin avisos" mensaje="Todas las líneas funcionan normalmente." />
        )}
      </Seccion>
    </Pantalla>
  );
}
