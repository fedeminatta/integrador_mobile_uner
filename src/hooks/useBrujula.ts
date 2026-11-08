import { useEffect, useState } from 'react';
import { Magnetometer } from 'expo-sensors';

export type EstadoBrujula = {
  angulo: number; 
  disponible: boolean;
};

export function useBrujula(): EstadoBrujula {
  const [estado, setEstado] = useState<EstadoBrujula>({
    angulo: 0,
    disponible: false,
  });

  useEffect(() => {
    let vivo = true;

    Magnetometer.isAvailableAsync().then((disponible) => {
      if (vivo) setEstado((e) => ({ ...e, disponible }));
    });

    const suscripcion = Magnetometer.addListener((medicion) => {
      if (!vivo) return;
      const { x, y } = medicion;

      let angulo = (Math.atan2(y, x) * 180) / Math.PI;
      if (angulo < 0) angulo += 360;

      setEstado((e) => ({ ...e, angulo, disponible: true }));
    });

    return () => {
      vivo = false;
      suscripcion.remove();
    };
  }, []);

  return estado;
}