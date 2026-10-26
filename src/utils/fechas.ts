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
