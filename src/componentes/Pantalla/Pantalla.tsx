import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { crearEstilos } from '@/componentes/Pantalla/Pantalla.estilos';
import { Texto } from '@/componentes/Texto/Texto';
import { useEstilos } from '@/tema';

type Props = {
  children: ReactNode;
  // Las pantallas principales dejan espacio para la barra de tabs flotante.
  conTabs?: boolean;
  // Panel a ancho completo arriba del contenido, que se desplaza con él (por ejemplo, la portada del login).
  cabecera?: ReactNode;
};

export function Pantalla({ children, conTabs = false, cabecera }: Props) {
  const e = useEstilos(crearEstilos);
  return (
    <KeyboardAvoidingView style={e.fondo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={e.fondo} keyboardShouldPersistTaps="handled">
        {cabecera}
        <View style={[e.contenido, conTabs ? e.conTabs : e.sinTabs]}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Seccion({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: ReactNode }) {
  const e = useEstilos(crearEstilos);
  return (
    <View style={e.seccion}>
      <View style={e.cabeceraSeccion}>
        <Texto variante="subtitulo">{titulo}</Texto>
        {!!descripcion && <Texto variante="chico">{descripcion}</Texto>}
      </View>
      {children}
    </View>
  );
}
