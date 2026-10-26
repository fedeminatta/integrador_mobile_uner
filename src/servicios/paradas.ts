import { lineasMock, paradasMock } from '@/mocks/datos';
import { responder } from '@/servicios/simulador';
import { Parada, Respuesta } from '@/tipos';

export type ParadaConLineas = Parada & { numerosLinea: string[] };

export function listarParadas(): Promise<Respuesta<ParadaConLineas[]>> {
  return responder(
    paradasMock.map((parada) => ({
      ...parada,
      numerosLinea: parada.lineaIds
        .map((id) => lineasMock.find((l) => l.id === id)?.numero)
        .filter((n): n is string => n !== undefined),
    })),
  );
}
