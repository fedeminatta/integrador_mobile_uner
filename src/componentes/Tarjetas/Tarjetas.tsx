import { Text, View } from 'react-native';

import { InsigniaLinea } from '@/componentes/InsigniaLinea/InsigniaLinea';
import { Tarjeta } from '@/componentes/Tarjeta/Tarjeta';
import { crearEstilos } from '@/componentes/Tarjetas/Tarjetas.estilos';
import { Texto } from '@/componentes/Texto/Texto';
import { ParadaConLineas } from '@/servicios/paradas';
import { useEstilos } from '@/tema';
import { Aviso, EstadoLinea, Linea, ProximoHorario } from '@/tipos';
import { rangoDeFechas } from '@/utils/fechas';

export function TarjetaHorario({ horario }: { horario: ProximoHorario }) {
  const e = useEstilos(crearEstilos);
  return (
    <Tarjeta enFila>
      <InsigniaLinea numero={horario.numeroLinea} />
      <View style={e.textos}>
        <Texto variante="destacado">Línea {horario.numeroLinea} → {horario.destino}</Texto>
        <Texto variante="chico">{horario.nombreParada}</Texto>
      </View>
      {/* Sin GPS en los colectivos: solo el horario de la tabla. */}
      <View style={e.hora}>
        <Texto variante="chico">según la tabla</Texto>
        <Texto variante="hora">{horario.hora}</Texto>
      </View>
    </Tarjeta>
  );
}

export function ChipEstado({ estado }: { estado: EstadoLinea }) {
  const e = useEstilos(crearEstilos);
  const desvio = estado === 'desvio';
  return (
    <View style={[e.chip, desvio ? e.chipDesvio : e.chipNormal]}>
      <Text style={[e.chipTexto, desvio ? e.chipTextoDesvio : e.chipTextoNormal]}>{desvio ? 'Con desvío' : 'Normal'}</Text>
    </View>
  );
}

export function TarjetaLinea({ linea }: { linea: Linea }) {
  const e = useEstilos(crearEstilos);
  return (
    <Tarjeta enFila>
      <InsigniaLinea numero={linea.numero} />
      <View style={e.textos}>
        <Texto variante="destacado">{linea.nombre}</Texto>
        <Texto variante="chico">{linea.recorrido}</Texto>
        <ChipEstado estado={linea.estado} />
      </View>
    </Tarjeta>
  );
}

export function TarjetaParada({ parada }: { parada: ParadaConLineas }) {
  const e = useEstilos(crearEstilos);
  return (
    <Tarjeta>
      <View style={e.cabeceraTextos}>
        <Texto variante="destacado">{parada.nombre}</Texto>
        {!!parada.referencia && <Texto variante="chico">{parada.referencia}</Texto>}
        <View style={e.insignias}>
          {parada.numerosLinea.map((n) => (
            <InsigniaLinea key={n} numero={n} chica />
          ))}
        </View>
      </View>
    </Tarjeta>
  );
}

export function TarjetaAviso({ aviso }: { aviso: Aviso }) {
  const e = useEstilos(crearEstilos);
  return (
    <Tarjeta>
      <View style={e.cabecera}>
        {aviso.numeroLinea && <InsigniaLinea numero={aviso.numeroLinea} chica />}
        <View style={e.cabeceraTextos}>
          <Texto variante="destacado">{aviso.titulo}</Texto>
        </View>
      </View>
      <Texto>{aviso.detalle}</Texto>
      <Texto variante="etiqueta">{rangoDeFechas(aviso.desde, aviso.hasta)}</Texto>
    </Tarjeta>
  );
}
