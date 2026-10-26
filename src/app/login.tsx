import { router } from 'expo-router';
import { useState } from 'react';

import { Boton } from '@/componentes/Boton/Boton';
import { GrupoBotones } from '@/componentes/Boton/GrupoBotones';
import { Cargando } from '@/componentes/Cargando/Cargando';
import { CampoTexto } from '@/componentes/CampoTexto/CampoTexto';
import { Notificacion } from '@/componentes/Notificacion/Notificacion';
import { Portada } from '@/componentes/Navegacion/Portada';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { Separador } from '@/componentes/Separador/Separador';
import { Tarjeta } from '@/componentes/Tarjeta/Tarjeta';
import { Texto } from '@/componentes/Texto/Texto';
import { useHaptica } from '@/hooks/useHaptica';
import { useSesion } from '@/hooks/useSesion';
import { validarCorreo } from '@/utils/validaciones';

export default function Login() {
  const { usuario, verificando, ingresar, salir } = useSesion();
  const haptica = useHaptica();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errores, setErrores] = useState<{ correo?: string; contrasena?: string }>({});
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const cambiarCorreo = (v: string) => {
    setCorreo(v);
    setErrores((e) => ({ ...e, correo: undefined }));
  };

  const cambiarContrasena = (v: string) => {
    setContrasena(v);
    setErrores((e) => ({ ...e, contrasena: undefined }));
  };

  const enviar = async () => {
    const nuevos = {
      correo: validarCorreo(correo) ?? undefined,
      contrasena: contrasena ? undefined : 'Escribe tu contraseña.',
    };
    setErrores(nuevos);
    setErrorServidor(null);
    if (nuevos.correo || nuevos.contrasena) {
      haptica.error();
      return;
    }
    setEnviando(true);
    const error = await ingresar(correo, contrasena);
    setEnviando(false);
    if (error) {
      setErrorServidor(error.mensaje);
      haptica.error();
      return;
    }
    haptica.exito();
    setContrasena('');
    router.replace('/');
  };

  if (verificando) {
    return (
      <Pantalla cabecera={<Portada />}>
        <Cargando texto="Verificando sesión" />
      </Pantalla>
    );
  }

  if (usuario) {
    return (
      <Pantalla cabecera={<Portada />}>
        <Tarjeta>
          <Texto variante="subtitulo">Ya iniciaste sesión</Texto>
          <Texto>
            Entraste como {usuario.nombre} ({usuario.correo}).
          </Texto>
          <GrupoBotones>
            <Boton texto="Ir al inicio" icono="home-outline" onPress={() => router.replace('/')} />
            <Boton texto="Cerrar sesión" variante="peligro" icono="log-out-outline" onPress={salir} />
          </GrupoBotones>
        </Tarjeta>
      </Pantalla>
    );
  }

  return (
    <Pantalla cabecera={<Portada />}>
      <Seccion titulo="Iniciar sesión" descripcion="Para reportar demoras y guardar favoritos.">
        {!!errorServidor && <Notificacion tipo="error" titulo="No pudimos iniciar sesión" mensaje={errorServidor} />}
        <CampoTexto
          etiqueta="Correo"
          tipo="correo"
          valor={correo}
          onCambiar={cambiarCorreo}
          placeholder="nombre@correo.com"
          error={errores.correo}
        />
        <CampoTexto
          etiqueta="Contraseña"
          tipo="contrasena"
          valor={contrasena}
          onCambiar={cambiarContrasena}
          placeholder="Tu contraseña"
          error={errores.contrasena}
          onEnviar={enviar}
        />
        <GrupoBotones>
          <Boton texto="Ingresar" icono="log-in-outline" cargando={enviando} onPress={enviar} />
          <Separador texto="o" />
          <Boton texto="Seguir sin cuenta" variante="secundario" onPress={() => router.replace('/')} />
        </GrupoBotones>
        <Texto variante="chico" centrado>
          ¿No tienes cuenta?
        </Texto>
        <Boton texto="Registrarme" variante="texto" icono="person-add-outline" onPress={() => router.push('/registro')} />
      </Seccion>
    </Pantalla>
  );
}
