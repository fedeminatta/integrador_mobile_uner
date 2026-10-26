import { lineasMock } from '@/mocks/datos';
import { responder } from '@/servicios/simulador';
import { Linea, Respuesta } from '@/tipos';

export function listarLineas(): Promise<Respuesta<Linea[]>> {
  return responder(lineasMock);
}
