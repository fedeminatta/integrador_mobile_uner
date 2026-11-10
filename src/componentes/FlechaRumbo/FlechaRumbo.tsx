import { StyleSheet, View } from 'react-native';

import { Icono } from '@/componentes/Icono/Icono';
import { Tarjeta } from '@/componentes/Tarjeta/Tarjeta';
import { Texto } from '@/componentes/Texto/Texto';
import { useBrujula } from '@/hooks/useBrujula';
import { espacio, radio, Tema, useEstilos } from '@/tema';
import { formatoDistancia, metrosEntre } from '@/utils/distancia';
import { calcularBearing } from '@/utils/rumbo';

// Flecha que gira con el magnetómetro y apunta hacia la parada aunque todavía no se vea.
export function FlechaRumbo({
  latUsuario,
  lonUsuario,
  latParada,
  lonParada,
}: {
  latUsuario: number;
  lonUsuario: number;
  latParada: number;
  lonParada: number;
}) {
  const e = useEstilos(crearEstilos);
  const { angulo: brujula, disponible } = useBrujula();

  const bearing = calcularBearing(latUsuario, lonUsuario, latParada, lonParada);
  const rotacion = bearing - brujula;
  const direccion = obtenerDireccionCardinal(bearing);
  const distancia = metrosEntre({ latitud: latUsuario, longitud: lonUsuario }, { latitud: latParada, longitud: lonParada });

  return (
    <Tarjeta enFila>
      <View style={e.circulo}>
        {/* El ícono "navigate" apunta al noreste: se corrige 45° para que apunte hacia arriba. */}
        <View style={{ transform: [{ rotate: `${rotacion - 45}deg` }] }}>
          <Icono nombre="navigate" tamano={30} color="sobreInsignia" />
        </View>
      </View>
      <View style={e.textos}>
        <Texto variante="destacado">A {formatoDistancia(distancia)}</Texto>
        <Texto variante="chico">
          {disponible ? `La parada queda hacia el ${direccion}. Gira el teléfono y sigue la flecha.` : 'Calibrando la brújula…'}
        </Texto>
      </View>
    </Tarjeta>
  );
}

function obtenerDireccionCardinal(grados: number): string {
  const direcciones = ['norte', 'noreste', 'este', 'sureste', 'sur', 'suroeste', 'oeste', 'noroeste'];
  const index = Math.round(grados / 45) % 8;
  return direcciones[index];
}

const crearEstilos = ({ colores }: Tema) =>
  StyleSheet.create({
    circulo: {
      width: 56,
      height: 56,
      borderRadius: radio.pildora,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colores.insignia,
    },
    textos: { flex: 1, minWidth: 0, gap: 2, marginLeft: espacio.m },
  });
