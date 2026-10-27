import { pedirTodas } from './api';
import { responder } from './simulador';
import { calcularProximosHorarios } from '../utils/fechas';
import { ProximoHorario, Respuesta } from '../tipos';

/**
 * Obtiene los próximos colectivos de una parada calculando los minutos restantes.
 */
export async function proximosEnParada(
  paradaId: string,
  limite: number = 3
): Promise<Respuesta<ProximoHorario[]>> {
  try {
    // 1. Pide los horarios a la API local
    const { datos: horarios } = await pedirTodas<any>(`/paradas/${paradaId}/horarios`);

    // 2. Extrae las horas ("HH:MM") aceptando distintos nombres de propiedad
    const listaHorariosTexto = horarios.map((h: any) => h.hora ?? h.horaSalida ?? h.horario ?? '');

    // 3. Calcula los próximos servicios y minutos faltantes
    const proximosProcesados = calcularProximosHorarios(listaHorariosTexto, new Date(), limite);

    // 4. Mapea al tipo ProximoHorario que espera la UI
    const resultado: any[] = proximosProcesados.map((p, index) => ({
      id: `${paradaId}-${index}`,
      paradaId,
      lineaId: 'linea-1',
      hora: p.hora,
      minutos: p.minutosFaltantes,
      minutosFaltantes: p.minutosFaltantes,
    }));

    return responder(resultado as ProximoHorario[]);
  } catch (error) {
    console.error('Error al obtener próximos horarios:', error);
    return responder([]);
  }
}