import { View } from 'react-native';

import { Boton } from '@/componentes/Boton/Boton';
import { crearEstilos } from '@/componentes/Estados/Estados.estilos';
import { Icono, NombreIcono } from '@/componentes/Icono/Icono';
import { Notificacion } from '@/componentes/Notificacion/Notificacion';
import { Texto } from '@/componentes/Texto/Texto';
import { useEstilos } from '@/tema';
import { ErrorApi } from '@/tipos';

export function EstadoVacio({ icono = 'file-tray-outline', titulo, mensaje }: { icono?: NombreIcono; titulo: string; mensaje?: string }) {
  const e = useEstilos(crearEstilos);
  return (
    <View style={e.vacio}>
      <View style={e.iconoVacio}>
        <Icono nombre={icono} tamano={26} color="enlace" />
      </View>
      <Texto variante="destacado" centrado>
        {titulo}
      </Texto>
      {!!mensaje && (
        <Texto variante="chico" centrado>
          {mensaje}
        </Texto>
      )}
    </View>
  );
}

export function ErrorReintentar({ error, onReintentar }: { error: ErrorApi; onReintentar: () => void }) {
  const e = useEstilos(crearEstilos);
  return (
    <View style={e.error}>
      <Notificacion tipo="error" titulo="No se pudo cargar" mensaje={error.mensaje} />
      <Boton texto="Reintentar" variante="secundario" icono="refresh" onPress={onReintentar} />
    </View>
  );
}
