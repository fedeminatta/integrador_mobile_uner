import { router } from 'expo-router';
import { useState } from 'react';

import { Boton } from '@/componentes/Boton/Boton';
import { GrupoBotones } from '@/componentes/Boton/GrupoBotones';
import { CampoTexto } from '@/componentes/CampoTexto/CampoTexto';
import { Notificacion } from '@/componentes/Notificacion/Notificacion';
import { Pantalla } from '@/componentes/Pantalla/Pantalla';
import { Tarjeta } from '@/componentes/Tarjeta/Tarjeta';
import { Texto } from '@/componentes/Texto/Texto';
import { useHaptica } from '@/hooks/useHaptica';
import { useSesion } from '@/hooks/useSesion';
import { validarContrasenaNueva, validarCorreo, validarNombre } from '@/utils/validaciones';

type Errores = { nombre?: string; correo?: string; contrasena?: string; repetir?: string };

export default function Registro() {
  const { crearCuenta } = useSesion();
  const haptica = useHaptica();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [repetir, setRepetir] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Al editar un campo se borra su error.
  const cambiar = (campo: keyof Errores, set: (v: string) => void) => (v: string) => {
    set(v);
    setErrores((e) => ({ ...e, [campo]: undefined }));
  };

  const enviar = async () => {
    const nuevos: Errores = {
      nombre: validarNombre(nombre) ?? undefined,
      correo: validarCorreo(correo) ?? undefined,
      contrasena: validarContrasenaNueva(contrasena) ?? undefined,
      repetir: repetir === contrasena ? undefined : 'Las contraseñas no coinciden.',
    };
    setErrores(nuevos);
    setErrorServidor(null);
    if (Object.values(nuevos).some(Boolean)) {
      haptica.error();
      return;
    }
    setEnviando(true);
    const error = await crearCuenta(nombre, correo, contrasena);
    setEnviando(false);
    if (error) {
      setErrorServidor(error.mensaje);
      haptica.error();
      return;
    }
    haptica.exito();
    router.replace('/');
  };

  return (
    <Pantalla>
      <Tarjeta>
        <Texto variante="subtitulo">Crea tu cuenta</Texto>
        <Texto variante="chico">La app funciona igual sin cuenta. Con una cuenta tus favoritos se guardan en la nube.</Texto>
        {!!errorServidor && <Notificacion tipo="error" titulo="No pudimos crear la cuenta" mensaje={errorServidor} />}
        <CampoTexto etiqueta="Nombre" valor={nombre} onCambiar={cambiar('nombre', setNombre)} placeholder="Cómo te llamas" error={errores.nombre} />
        <CampoTexto etiqueta="Correo" tipo="correo" valor={correo} onCambiar={cambiar('correo', setCorreo)} placeholder="nombre@correo.com" error={errores.correo} />
        <CampoTexto
          etiqueta="Contraseña"
          tipo="contrasena"
          valor={contrasena}
          onCambiar={cambiar('contrasena', setContrasena)}
          placeholder="Al menos 6 caracteres"
          error={errores.contrasena}
        />
        <CampoTexto
          etiqueta="Repetir contraseña"
          tipo="contrasena"
          valor={repetir}
          onCambiar={cambiar('repetir', setRepetir)}
          placeholder="Escríbela de nuevo"
          error={errores.repetir}
          onEnviar={enviar}
        />
        <GrupoBotones>
          <Boton texto="Crear cuenta" icono="person-add-outline" cargando={enviando} onPress={enviar} />
          <Boton texto="Ya tengo cuenta, iniciar sesión" variante="secundario" onPress={() => router.replace('/login')} />
        </GrupoBotones>
      </Tarjeta>
    </Pantalla>
  );
}
