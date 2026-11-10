import { useCallback } from 'react';
import { View } from 'react-native';

import { Bloque } from '@/componentes/Esqueleto/Esqueleto';
import { Icono } from '@/componentes/Icono/Icono';
import { InsigniaLinea } from '@/componentes/InsigniaLinea/InsigniaLinea';
import { crearEstilos } from '@/componentes/Red/Red.estilos';
import { Tarjeta } from '@/componentes/Tarjeta/Tarjeta';
import { Texto } from '@/componentes/Texto/Texto';
import { useCarga } from '@/hooks/useCarga';
import { obtenerParada, proximosEnParadaRed } from '@/servicios/red';
import { useEstilos } from '@/tema';
import { esDeManana } from '@/utils/tablas';

type Props = {
  paradaId: string;
  // Número de cada línea por id (para las insignias).
  numeros: Map<string, string>;
  onPress: () => void;
};

// Parada favorita del inicio: el nombre y los próximos de cada línea según la tabla.
export function ParadaConProximos({ paradaId, numeros, onPress }: Props) {
  const e = useEstilos(crearEstilos);
  const parada = useCarga(useCallback(() => obtenerParada(paradaId), [paradaId]));
  const proximos = useCarga(useCallback(() => proximosEnParadaRed(paradaId), [paradaId]));

  const ahora = new Date();
  const lineas = [...new Set((proximos.datos ?? []).map((h) => h.lineaId))];

  return (
    <Tarjeta onPress={onPress} etiquetaAccesible={`Parada ${parada.datos?.nombre ?? ''}. Ver horarios`}>
      <View style={e.fila}>
        <View style={e.textosSinMargen}>
          {parada.datos ? <Texto variante="destacado">{parada.datos.nombre}</Texto> : <Bloque forma="lineaCorta" />}
          <Texto variante="chico">Según la tabla</Texto>
        </View>
        <Icono nombre="chevron-forward" tamano={20} color="textoSuave" />
      </View>
      {proximos.cargando ? (
        <Bloque forma="linea" />
      ) : proximos.error ? (
        <Texto variante="chico" tono="error">
          {proximos.error.mensaje}
        </Texto>
      ) : lineas.length ? (
        lineas.map((lineaId) => {
          const horas = (proximos.datos ?? []).filter((h) => h.lineaId === lineaId).map((h) => h.hora);
          return (
            <View key={lineaId} style={e.fila}>
              <InsigniaLinea numero={numeros.get(lineaId) ?? '?'} chica />
              <Texto variante="destacado">
                {esDeManana(horas[0], ahora) ? `Mañana a las ${horas[0]}` : horas.join('  ·  ')}
              </Texto>
            </View>
          );
        })
      ) : (
        <Texto variante="chico">Sin servicio hoy ni mañana.</Texto>
      )}
    </Tarjeta>
  );
}
