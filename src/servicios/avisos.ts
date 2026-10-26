import { avisosMock } from '@/mocks/datos';
import { responder } from '@/servicios/simulador';
import { Aviso, Respuesta } from '@/tipos';

export function listarAvisos(): Promise<Respuesta<Aviso[]>> {
  return responder(avisosMock);
}
