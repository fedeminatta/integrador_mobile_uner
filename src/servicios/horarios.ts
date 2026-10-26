import { proximosMock } from '@/mocks/datos';
import { responder } from '@/servicios/simulador';
import { ProximoHorario, Respuesta } from '@/tipos';

export function proximosEnParada(paradaId: string): Promise<Respuesta<ProximoHorario[]>> {
  return responder(proximosMock.filter((h) => h.paradaId === paradaId));
}
