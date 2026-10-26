import { useState } from 'react';
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';

import { crearEstilos } from '@/componentes/CampoTexto/CampoTexto.estilos';
import { Icono, NombreIcono } from '@/componentes/Icono/Icono';
import { useEstilos, useTema } from '@/tema';

export type TipoCampo = 'texto' | 'correo' | 'contrasena' | 'busqueda';

type Props = {
  etiqueta: string;
  valor: string;
  onCambiar: (valor: string) => void;
  tipo?: TipoCampo;
  placeholder?: string;
  error?: string | null;
  onEnviar?: () => void;
};

const propsPorTipo: Record<TipoCampo, TextInputProps> = {
  texto: { autoCapitalize: 'words' },
  correo: { autoCapitalize: 'none', autoCorrect: false, keyboardType: 'email-address', autoComplete: 'email', textContentType: 'emailAddress' },
  contrasena: { autoCapitalize: 'none', autoCorrect: false, autoComplete: 'password', textContentType: 'password' },
  busqueda: { autoCapitalize: 'none', autoCorrect: false, returnKeyType: 'search' },
};

const iconoPorTipo: Partial<Record<TipoCampo, NombreIcono>> = {
  correo: 'mail-outline',
  contrasena: 'lock-closed-outline',
  busqueda: 'search',
};

export function CampoTexto({ etiqueta, valor, onCambiar, tipo = 'texto', placeholder, error, onEnviar }: Props) {
  const e = useEstilos(crearEstilos);
  const { colores } = useTema();
  const [foco, setFoco] = useState(false);
  const [visible, setVisible] = useState(false);
  const icono = iconoPorTipo[tipo];

  return (
    <View style={e.contenedor}>
      <Text style={e.etiqueta}>{etiqueta}</Text>
      <View style={[e.caja, foco && e.cajaFoco, !!error && e.cajaError]}>
        {icono && <Icono nombre={icono} tamano={18} color="textoSuave" />}
        <TextInput
          {...propsPorTipo[tipo]}
          accessibilityLabel={etiqueta}
          value={valor}
          onChangeText={onCambiar}
          placeholder={placeholder}
          placeholderTextColor={colores.textoSuave}
          secureTextEntry={tipo === 'contrasena' && !visible}
          onFocus={() => setFoco(true)}
          onBlur={() => setFoco(false)}
          onSubmitEditing={onEnviar}
          style={e.entrada}
        />
        {tipo === 'contrasena' && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
            style={e.ojo}>
            <Icono nombre={visible ? 'eye-off-outline' : 'eye-outline'} tamano={20} color="textoSuave" />
          </Pressable>
        )}
      </View>
      {!!error && <Text style={e.mensajeError}>{error}</Text>}
    </View>
  );
}
