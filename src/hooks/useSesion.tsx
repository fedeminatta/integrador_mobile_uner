import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { borrarToken, guardarToken, leerToken } from '@/db/almacen-seguro';
import { desbloquearConBiometria, hayBiometriaDisponible } from '@/servicios/biometria';
import { iniciarSesion, registrar, usuarioDelToken, type Resultado } from '@/servicios/auth';
import type { RespuestaError, Sesion } from '@/tipos/api';
import type { Usuario } from '@/tipos/types';

type ErrorSesion = RespuestaError['error'];

type ContextoSesion = {
  usuario: Usuario | null;
  /** True mientras se lee el token guardado. */
  verificando: boolean;
  /** True cuando hay token y hay que confirmar identidad con biometría antes de entrar. */
  bloqueado: boolean;
  ingresar: (correo: string, contrasena: string) => Promise<ErrorSesion | null>;
  crearCuenta: (nombre: string, correo: string, contrasena: string) => Promise<ErrorSesion | null>;
  /** Pide la biometría y, si pasa valida el token contra GET /yo. */
  desbloquear: () => Promise<ErrorSesion | null>;
  salir: () => Promise<void>;
};

const Contexto = createContext<ContextoSesion | null>(null);

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [bloqueado, setBloqueado] = useState(false);

  /** Trae el usuario con el token. Si el token vencio, lo borra. Devuelve el error, si hubo. */
  const cargarUsuario = useCallback(async (token: string): Promise<ErrorSesion | null> => {
    const r = await usuarioDelToken(token);
    if ('error' in r) {
      if (r.error.codigo === 'NO_AUTENTICADO') await borrarToken();
      setUsuario(null);
      return r.error;
    }
    setUsuario(r.datos);
    return null;
  }, []);

  // Arranque: sin token no pasa nada; con token y biometría, se bloquea la app.
  useEffect(() => {
    let vivo = true;
    (async () => {
      const token = await leerToken();
      if (!vivo) return;
      if (!token) {
        setVerificando(false);
        return;
      }
      const conBiometria = await hayBiometriaDisponible();
      if (!vivo) return;
      if (conBiometria) {
        setBloqueado(true);
        setVerificando(false);
        return;
      }
      await cargarUsuario(token);
      if (vivo) setVerificando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [cargarUsuario]);

  const aplicar = useCallback(async (r: Resultado<Sesion>) => {
    if ('error' in r) return r.error;
    await guardarToken(r.datos.token);
    setUsuario(r.datos.usuario);
    setBloqueado(false);
    return null;
  }, []);

  const ingresar = useCallback(
    (correo: string, contrasena: string) => iniciarSesion(correo, contrasena).then(aplicar),
    [aplicar],
  );

  const crearCuenta = useCallback(
    (nombre: string, correo: string, contrasena: string) =>
      registrar(nombre, correo, contrasena).then(aplicar),
    [aplicar],
  );

  const desbloquear = useCallback(async (): Promise<ErrorSesion | null> => {
    const r = await desbloquearConBiometria();
    if (!r.ok) {
      // Cancelo el usuario: no hay error que mostrar,
      if (r.cancelo) return null;
      return { codigo: 'DESBLOQUEO_FALLIDO', mensaje: r.mensaje };
    }
    const token = await leerToken();
    if (!token) {
      setBloqueado(false);
      return null;
    }
     const error = await cargarUsuario(token);
    if (error?.codigo === 'NO_AUTENTICADO') {
      // Token vencido: cargarUsuario ya lo borro; sale del bloqueo sin sesión.
      setBloqueado(false);
      return null;
    }
    // Exito: levanta la cortina. Sin red u otro fallo: sigue bloqueado y muestra el mensaje.
    if (!error) setBloqueado(false);
    return error;
  }, [cargarUsuario]);

  const salir = useCallback(async () => {
    await borrarToken();
    setUsuario(null);
    setBloqueado(false);
  }, []);

  const valor = useMemo(
    () => ({ usuario, verificando, bloqueado, ingresar, crearCuenta, desbloquear, salir }),
    [usuario, verificando, bloqueado, ingresar, crearCuenta, desbloquear, salir],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSesion(): ContextoSesion {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useSesion debe usarse dentro de ProveedorSesion');
  return ctx;
}