import { leerToken } from '@/db/almacen-seguro';
import { reportesRedMock } from '@/mocks/red';
import { pedir } from '@/servicios/api';
import { desdeApi, usaDatosDePrueba } from '@/servicios/red';
import { fallar, responder } from '@/servicios/simulador';
import { Respuesta } from '@/tipos';
import type { MotivoDemora, ReporteDeDemora } from '@/tipos/types';
import { isoParana } from '@/utils/tablas';

export const motivosDemora: { motivo: MotivoDemora; titulo: string }[] = [
  { motivo: 'no_paso', titulo: 'No pasó' },
  { motivo: 'paso_lleno', titulo: 'Pasó lleno y no paró' },
  { motivo: 'demorado', titulo: 'Viene demorado' },
  { motivo: 'unidad_rota', titulo: 'Unidad rota' },
  { motivo: 'calle_cortada', titulo: 'Calle cortada' },
];

export function tituloMotivo(motivo: MotivoDemora): string {
  return motivosDemora.find((m) => m.motivo === motivo)?.titulo ?? motivo;
}

export type NuevoReporte = {
  lineaId: string;
  paradaId: string;
  motivo: MotivoDemora;
  comentario: string | null;
};

const sinSesion = () => fallar<never>({ codigo: 'NO_AUTENTICADO', mensaje: 'Para reportar o confirmar tienes que iniciar sesión.' });

// Usuario de los datos de prueba (ver usuariosMock).
const USUARIO_DE_PRUEBA = 'u1';
const VIGENCIA_MS = 90 * 60_000;

// Reportes de los últimos 90 minutos en la parada.
export function reportesDeParada(paradaId: string): Promise<Respuesta<ReporteDeDemora[]>> {
  if (usaDatosDePrueba) {
    const recientes = reportesRedMock.filter((r) => r.paradaId === paradaId && Date.now() - new Date(r.fechaHora).getTime() < VIGENCIA_MS);
    return responder([...recientes].sort((a, b) => b.fechaHora.localeCompare(a.fechaHora)));
  }
  return desdeApi(() => pedir<ReporteDeDemora[]>(`/reportes-demora?paradaId=${encodeURIComponent(paradaId)}`));
}

export async function enviarReporte(nuevo: NuevoReporte): Promise<Respuesta<ReporteDeDemora>> {
  const token = await leerToken();
  if (!token) return sinSesion();
  const fechaHora = isoParana(new Date());

  if (usaDatosDePrueba) {
    const reporte: ReporteDeDemora = {
      ...nuevo,
      id: `rep-${Date.now()}`,
      usuarioId: USUARIO_DE_PRUEBA,
      fotoUri: null,
      confirmaciones: 0,
      fechaHora,
      sincronizado: true,
    };
    reportesRedMock.unshift(reporte);
    return responder(reporte);
  }
  return desdeApi(() => pedir<ReporteDeDemora>('/reportes-demora', { metodo: 'POST', token, cuerpo: { ...nuevo, fotoUri: null, fechaHora } }));
}

export async function confirmarReporte(id: string): Promise<Respuesta<ReporteDeDemora>> {
  const token = await leerToken();
  if (!token) return sinSesion();

  if (usaDatosDePrueba) {
    const reporte = reportesRedMock.find((r) => r.id === id);
    if (!reporte) return fallar({ codigo: 'REPORTE_NO_ENCONTRADO', mensaje: 'No encontramos ese reporte.' });
    if (reporte.usuarioId === USUARIO_DE_PRUEBA) return fallar({ codigo: 'CONFIRMACION_PROPIA', mensaje: 'No puedes confirmar tu propio reporte.' });
    reporte.confirmaciones += 1;
    return responder(reporte);
  }
  return desdeApi(() => pedir<ReporteDeDemora>(`/reportes-demora/${encodeURIComponent(id)}/confirmaciones`, { metodo: 'POST', token }));
}
