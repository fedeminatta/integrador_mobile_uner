import { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';

import { Boton, VarianteBoton } from '@/componentes/Boton/Boton';
import { GrupoBotones } from '@/componentes/Boton/GrupoBotones';
import { crearEstilos } from '@/componentes/Dialogo/Dialogo.estilos';
import { Icono, NombreIcono } from '@/componentes/Icono/Icono';
import { Texto } from '@/componentes/Texto/Texto';
import { useEstilos } from '@/tema';

export type AccionDialogo = {
  texto: string;
  variante?: VarianteBoton;
  onPress: () => void;
  cargando?: boolean;
};

type Props = {
  visible: boolean;
  titulo: string;
  mensaje?: string;
  icono?: NombreIcono;
  acciones: AccionDialogo[];
  onCerrar: () => void;
  children?: ReactNode;
};

// Modal centrado. Las acciones van apiladas, la principal primero.
export function Dialogo({ visible, titulo, mensaje, icono = 'alert', acciones, onCerrar, children }: Props) {
  const e = useEstilos(crearEstilos);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar} statusBarTranslucent>
      <Pressable style={e.velo} onPress={onCerrar} accessibilityLabel="Cerrar">
        <Pressable style={e.caja} accessibilityViewIsModal onPress={() => {}}>
          <View style={e.icono}>
            <Icono nombre={icono} tamano={28} color="sobreInsignia" />
          </View>
          <Texto variante="subtitulo" centrado>
            {titulo}
          </Texto>
          {!!mensaje && (
            <Texto tono="suave" centrado>
              {mensaje}
            </Texto>
          )}
          {children}
          <View style={e.acciones}>
            <GrupoBotones>
              {acciones.map((a) => (
                <Boton key={a.texto} texto={a.texto} variante={a.variante} onPress={a.onPress} cargando={a.cargando} />
              ))}
            </GrupoBotones>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
