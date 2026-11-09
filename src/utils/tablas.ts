import type { Horario, TipoDeDia } from '@/tipos/types';

// Funciones puras para leer las tablas de horarios. Paraná está siempre en -03:00 (sin horario de verano).
const DESFASE_PARANA_MS = -3 * 60 * 60_000;

const enParana = (fecha: Date) => new Date(fecha.getTime() + DESFASE_PARANA_MS);
const dosCifras = (n: number) => String(n).padStart(2, '0');

// "2026-11-09T14:05:00-03:00"
export function isoParana(fecha: Date): string {
  const p = enParana(fecha);
  return `${p.toISOString().slice(0, 19)}-03:00`;
}

// "AAAA-MM-DD" del día en Paraná.
export function fechaParana(fecha: Date): string {
  return enParana(fecha).toISOString().slice(0, 10);
}

// "HH:MM" de la hora en Paraná.
export function horaParana(fecha: Date): string {
  const p = enParana(fecha);
  return `${dosCifras(p.getUTCHours())}:${dosCifras(p.getUTCMinutes())}`;
}

export function minutosDelDia(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

// Un feriado gana sobre el sábado y el domingo.
export function tipoDeDia(fecha: Date, feriados: string[]): TipoDeDia {
  if (feriados.includes(fechaParana(fecha))) return 'feriado';
  const dia = enParana(fecha).getUTCDay();
  if (dia === 0) return 'domingo';
  if (dia === 6) return 'sabado';
  return 'habil';
}

export function manana(fecha: Date): Date {
  return new Date(fecha.getTime() + 24 * 60 * 60_000);
}

// Un horario con hora menor que la actual es de mañana (así lo devuelve la API).
export function esDeManana(hora: string, ahora: Date): boolean {
  return minutosDelDia(hora) < minutosDelDia(horaParana(ahora));
}

// Minutos que faltan según la tabla (si es de mañana, cuenta hasta mañana a esa hora).
export function minutosHasta(hora: string, ahora: Date): number {
  const diferencia = minutosDelDia(hora) - minutosDelDia(horaParana(ahora));
  return diferencia < 0 ? diferencia + 24 * 60 : diferencia;
}

/**
 * Próximos pasos de cada línea por una parada: los `cantidad` siguientes de la tabla de hoy
 * y, si no alcanzan, los primeros de la tabla de mañana. Igual que GET /paradas/:id/proximos.
 */
export function proximosPorLinea(horarios: Horario[], ahora: Date, feriados: string[], cantidad = 3): Horario[] {
  const tipoHoy = tipoDeDia(ahora, feriados);
  const tipoManana = tipoDeDia(manana(ahora), feriados);
  const actual = minutosDelDia(horaParana(ahora));
  const porHora = (a: Horario, b: Horario) => minutosDelDia(a.hora) - minutosDelDia(b.hora);

  const resultado: Horario[] = [];
  const lineas = [...new Set(horarios.map((h) => h.lineaId))];
  for (const lineaId of lineas) {
    const deLinea = horarios.filter((h) => h.lineaId === lineaId);
    const hoy = deLinea.filter((h) => h.tipoDeDia === tipoHoy && minutosDelDia(h.hora) >= actual).sort(porHora);
    const deManana = deLinea.filter((h) => h.tipoDeDia === tipoManana && minutosDelDia(h.hora) < actual).sort(porHora);
    resultado.push(...[...hoy, ...deManana].slice(0, cantidad));
  }
  return resultado;
}

const etiquetasTipoDeDia: Record<TipoDeDia, string> = {
  habil: 'Hábiles',
  sabado: 'Sábados',
  domingo: 'Domingos',
  feriado: 'Feriados',
};

export function etiquetaTipoDeDia(tipo: TipoDeDia): string {
  return etiquetasTipoDeDia[tipo];
}

// "hace 5 min", "hace 2 h", "hace 3 días"
export function haceCuanto(iso: string, ahora: Date): string {
  const minutos = Math.max(0, Math.round((ahora.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutos < 1) return 'recién';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.round(horas / 24);
  return dias === 1 ? 'hace 1 día' : `hace ${dias} días`;
}
