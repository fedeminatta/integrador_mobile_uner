import { ReactNode, useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, View } from 'react-native';

import { BannerConexion } from '@/componentes/BannerConexion/BannerConexion';
import { crearEstilos } from '@/componentes/Pantalla/Pantalla.estilos';
import { Texto } from '@/componentes/Texto/Texto';
import { useEstilos, useTema } from '@/tema';

type Props = {
  children: ReactNode;
  // Las pantallas principales dejan espacio para la barra de tabs flotante.
  conTabs?: boolean;
  // Panel a ancho completo arriba del contenido, que se desplaza con él (por ejemplo, la portada del login).
  cabecera?: ReactNode;
  // Deslizar hacia abajo desde arriba de todo vuelve a pedir los datos.
  onRefrescar?: () => void;
};

export function Pantalla({ children, conTabs = false, cabecera, onRefrescar }: Props) {
  const e = useEstilos(crearEstilos);
  const { colores } = useTema();
  const [refrescando, setRefrescando] = useState(false);

  const refrescar = () => {
    if (!onRefrescar) return;
    setRefrescando(true);
    onRefrescar();
    // Las pantallas muestran su propio esqueleto mientras cargan: el indicador solo confirma el gesto.
    setTimeout(() => setRefrescando(false), 600);
  };

  return (
    <KeyboardAvoidingView style={e.fondo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={e.fondo}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefrescar ? (
            <RefreshControl refreshing={refrescando} onRefresh={refrescar} colors={[colores.primario]} tintColor={colores.primario} />
          ) : undefined
        }>
        {cabecera}
        <View style={[e.contenido, conTabs ? e.conTabs : e.sinTabs]}>
          <BannerConexion />
          {children}
        </View>
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
