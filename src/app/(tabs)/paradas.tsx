import { useState } from 'react';

import { CampoTexto } from '@/componentes/CampoTexto/CampoTexto';
import { EsqueletoLista } from '@/componentes/Esqueleto/Esqueleto';
import { EstadoVacio, ErrorReintentar } from '@/componentes/Estados/Estados';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { TarjetaParada } from '@/componentes/Tarjetas/Tarjetas';
import { useCarga } from '@/hooks/useCarga';
import { listarParadas } from '@/servicios/paradas';

export default function Paradas() {
  const { datos, error, cargando, recargar } = useCarga(listarParadas);
  const [busqueda, setBusqueda] = useState('');

  const termino = busqueda.trim().toLowerCase();
  const filtradas = (datos ?? []).filter(
    (p) => !termino || p.nombre.toLowerCase().includes(termino) || p.numerosLinea.includes(termino),
  );

  return (
    <Pantalla conTabs>
      <CampoTexto
        etiqueta="Buscar parada"
        tipo="busqueda"
        valor={busqueda}
        onCambiar={setBusqueda}
        placeholder="Calle, esquina o número de línea"
      />
      <Seccion titulo="Paradas" descripcion="Sin permiso de ubicación se listan por nombre">
        {cargando ? (
          <EsqueletoLista variante="parada" cantidad={4} />
        ) : error ? (
          <ErrorReintentar error={error} onReintentar={recargar} />
        ) : filtradas.length ? (
          filtradas.map((p) => <TarjetaParada key={p.id} parada={p} />)
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
