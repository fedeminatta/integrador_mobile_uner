import { Pressable, Text, View } from 'react-native';

import { Icono, NombreIcono } from '@/componentes/Icono/Icono';
import { crearEstilos } from '@/componentes/Notificacion/Notificacion.estilos';
import { Colores, useEstilos } from '@/tema';

export type TipoNotificacion = 'aviso' | 'info' | 'error' | 'exito';

type Props = {
  tipo?: TipoNotificacion;
  titulo: string;
  mensaje?: string;
  onCerrar?: () => void;
};

const config: Record<TipoNotificacion, { icono: NombreIcono; color: keyof Colores; fondo: 'iconoAviso' | 'iconoInfo' | 'iconoError' | 'iconoExito' }> = {
  aviso: { icono: 'warning', color: 'sobreInsignia', fondo: 'iconoAviso' },
  info: { icono: 'information', color: 'enlace', fondo: 'iconoInfo' },
  error: { icono: 'alert', color: 'error', fondo: 'iconoError' },
  exito: { icono: 'checkmark', color: 'exito', fondo: 'iconoExito' },
};

export function Notificacion({ tipo = 'aviso', titulo, mensaje, onCerrar }: Props) {
  const e = useEstilos(crearEstilos);
  const c = config[tipo];
  return (
    <View style={[e.contenedor, e[tipo]]} accessibilityRole="alert">
      <View style={[e.icono, e[c.fondo]]}>
        <Icono nombre={c.icono} tamano={16} color={c.color} />
      </View>
      <View style={e.textos}>
        <Text style={e.titulo}>{titulo}</Text>
        {!!mensaje && <Text style={e.mensaje}>{mensaje}</Text>}
      </View>
      {onCerrar && (
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar aviso" onPress={onCerrar} hitSlop={8} style={e.cerrar}>
          <Icono nombre="close" tamano={18} color="textoSuave" />
        </Pressable>
      )}
    </View>
  );
}
