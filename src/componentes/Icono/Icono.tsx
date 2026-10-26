import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';

import { Colores, useTema } from '@/tema';

export type NombreIcono = ComponentProps<typeof Ionicons>['name'];

type Props = {
  nombre: NombreIcono;
  tamano?: number;
  color?: keyof Colores;
};

export function Icono({ nombre, tamano = 22, color = 'texto' }: Props) {
  const { colores } = useTema();
  return <Ionicons name={nombre} size={tamano} color={colores[color]} />;
}
