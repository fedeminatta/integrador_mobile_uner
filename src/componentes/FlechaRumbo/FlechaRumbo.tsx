import { StyleSheet, Text, View } from 'react-native';

import { useBrujula } from '@/hooks/useBrujula';
import { calcularBearing } from '@/utils/rumbo';

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
  const { angulo: brújula, disponible } = useBrujula();

  const bearing = calcularBearing(latUsuario, lonUsuario, latParada, lonParada);
  const rotacion = bearing - brújula;
  const direccion = obtenerDireccionCardinal(bearing);

  return (
    <View style={styles.contenedor}>
      <View style={styles.tarjeta}>
        <View style={[styles.contenedorFlecha, { transform: [{ rotate: `${rotacion}deg` }] }]}>
          <Text style={styles.flecha}>^</Text>
        </View>
        <Text style={styles.leyenda}>
          {disponible ? `Hacia la parada (${direccion})` : 'Calibrando brújula…'}
        </Text>
      </View>
    </View>
  );
}

function obtenerDireccionCardinal(grados: number): string {
  const direcciones = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const index = Math.round(grados / 45) % 8;
  return direcciones[index];
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    marginTop: 16,
  },
  tarjeta: {
    backgroundColor: '#208AEF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 200,
  },
  contenedorFlecha: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  flecha: {
    fontSize: 56,
    color: '#ffffff',
    lineHeight: 56,
  },
  leyenda: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
});