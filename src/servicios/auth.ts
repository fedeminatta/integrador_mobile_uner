import { ErrorDeApi, pedir } from '@/servicios/api';
import type { RespuestaError, RespuestaUno, Sesion } from '@/tipos/api';
import type { Usuario } from '@/tipos/types';

/** Lo que esperan las pantallas: el  éxito o el de error de la API. */
export type Resultado<T> = RespuestaUno<T> | RespuestaError;

type OpcionesPedido = NonNullable<Parameters<typeof pedir>[1]>;

/**
 * `pedir()` lanza `ErrorDeApi` en vez de devolver `{ error }`.
 */
async function pedirSobre<T>(ruta: string, opciones: OpcionesPedido = {}): Promise<Resultado<T>> {
  try {
    const r = await pedir<T>(ruta, opciones);
    return { datos: r.datos, meta: null };
  } catch (e) {
    if (e instanceof ErrorDeApi) {
      return { error: { codigo: e.codigo, mensaje: e.message } };
    }
    return {
      error: { codigo: 'ERROR_DESCONOCIDO', mensaje: 'Algo salió mal. Probá de nuevo en un rato.' },
    };
  }
}

/** POST /auth/ingreso 200 { datos: { token, usuario } }. Errores: CREDENCIALES_INVALIDAS (401). */
export function iniciarSesion(correo: string, contrasena: string): Promise<Resultado<Sesion>> {
  return pedirSobre<Sesion>('/auth/ingreso', {
    metodo: 'POST',
    cuerpo: { email: correo.trim(), contrasena },
  });
}

/** POST /auth/registro 201 { datos: { token, usuario } }. Contraseña mínima 8. Errores: EMAIL_YA_REGISTRADO (409). */
export function registrar(
  nombre: string,
  correo: string,
  contrasena: string,
): Promise<Resultado<Sesion>> {
  return pedirSobre<Sesion>('/auth/registro', {
    metodo: 'POST',
    cuerpo: { nombre: nombre.trim(), email: correo.trim(), contrasena },
  });
}

/** GET /yo con Bearer { datos: Usuario, meta: null }. Token vencido: 401 NO_AUTENTICADO. */
export function usuarioDelToken(token: string): Promise<Resultado<Usuario>> {
  return pedirSobre<Usuario>('/yo', { token });
}