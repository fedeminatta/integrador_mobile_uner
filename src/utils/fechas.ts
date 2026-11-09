// Las fechas llegan en ISO 8601 con la zona de Paraná (-03:00), así que el día
// escrito en el texto ya es el día local.
export function diaMes(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

export function rangoDeFechas(desde: string, hasta: string | null): string {
  if (!hasta) return `Desde el ${diaMes(desde)}`;
  if (desde.slice(0, 10) === hasta.slice(0, 10)) return `El ${diaMes(desde)}`;
  return `Del ${diaMes(desde)} al ${diaMes(hasta)}`;
}
export type TipoDeDia = 'habil' | 'sabado' | 'domingo' | 'feriado';

/**
 * Determina el tipo de día según una fecha (por defecto hoy).
 * Permite pasar una lista opcional de feriados en formato "YYYY-MM-DD".
 */
export function obtenerTipoDeDia(
  fecha: Date = new Date(),
  feriados: string[] = []
): TipoDeDia {
  const isoFecha = fecha.toISOString().slice(0, 10);
  if (feriados.includes(isoFecha)) return 'feriado';

  const diaSemana = fecha.getDay(); // 0 = Domingo, 6 = Sábado
  if (diaSemana === 0) return 'domingo';
  if (diaSemana === 6) return 'sabado';
  return 'habil';
}

export interface ProximoHorarioInfo {
  hora: string;
  minutosFaltantes: number;
}

/**
 * Recibe una lista de horarios en formato "HH:MM" (ej: ["14:35", "15:10"]) 
 * y retorna los próximos `limite` servicios a partir de la hora dada.
 */
export function calcularProximosHorarios(
  horariosTexto: string[],
  ahora: Date = new Date(),
  limite: number = 3
): ProximoHorarioInfo[] {
  const minutosHoy = ahora.getHours() * 60 + ahora.getMinutes();

  const futuros = horariosTexto
    .map(horaStr => {
      const [hh, mm] = horaStr.split(':').map(Number);
      return {
        hora: horaStr,
        minutosTotales: hh * 60 + mm,
      };
    })
    .filter(h => h.minutosTotales >= minutosHoy)
    .sort((a, b) => a.minutosTotales - b.minutosTotales);

  return futuros.slice(0, limite).map(h => ({
    hora: h.hora,
    minutosFaltantes: h.minutosTotales - minutosHoy,
  }));
}