import { usuariosMock } from '@/mocks/datos';
import { fallar, responder } from '@/servicios/simulador';
import { Respuesta, Sesion, Usuario } from '@/tipos';

const PREFIJO_TOKEN = 'token-simulado-';

function crearSesion(usuario: Usuario): Sesion {
  return { token: PREFIJO_TOKEN + usuario.id, usuario };
}

export function iniciarSesion(correo: string, contrasena: string): Promise<Respuesta<Sesion>> {
  const encontrado = usuariosMock.find(
    (u) => u.correo.toLowerCase() === correo.trim().toLowerCase() && u.contrasena === contrasena,
  );
  if (!encontrado) {
    return fallar({ codigo: 'CREDENCIALES_INVALIDAS', mensaje: 'El correo o la contraseña no coinciden. Revísalos y prueba de nuevo.' });
  }
  const { contrasena: _omitida, ...usuario } = encontrado;
  return responder(crearSesion(usuario));
}

export function registrar(nombre: string, correo: string, contrasena: string): Promise<Respuesta<Sesion>> {
  const correoNormal = correo.trim().toLowerCase();
  if (usuariosMock.some((u) => u.correo === correoNormal)) {
    return fallar({ codigo: 'CORREO_EN_USO', mensaje: 'Ya hay una cuenta con ese correo. Inicia sesión o usa otro correo.' });
  }
  const usuario: Usuario = { id: `u${usuariosMock.length + 1}`, nombre: nombre.trim(), correo: correoNormal };
  usuariosMock.push({ ...usuario, contrasena });
  return responder(crearSesion(usuario));
}

export function usuarioDelToken(token: string): Promise<Respuesta<Usuario>> {
  const encontrado = usuariosMock.find((u) => PREFIJO_TOKEN + u.id === token);
  if (!encontrado) {
    return fallar({ codigo: 'SESION_VENCIDA', mensaje: 'Tu sesión venció. Vuelve a iniciar sesión.' });
  }
  const { contrasena: _omitida, ...usuario } = encontrado;
  return responder(usuario);
}
