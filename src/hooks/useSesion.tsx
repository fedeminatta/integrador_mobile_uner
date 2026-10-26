import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { borrarToken, guardarToken, leerToken } from '@/db/almacen-seguro';
import { iniciarSesion, registrar, usuarioDelToken } from '@/servicios/auth';
import { ErrorApi, Respuesta, Sesion, Usuario } from '@/tipos';

type ContextoSesion = {
  usuario: Usuario | null;
  verificando: boolean;
  ingresar: (correo: string, contrasena: string) => Promise<ErrorApi | null>;
  crearCuenta: (nombre: string, correo: string, contrasena: string) => Promise<ErrorApi | null>;
  salir: () => Promise<void>;
};

const Contexto = createContext<ContextoSesion | null>(null);

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    leerToken().then(async (token) => {
      if (token) {
        const r = await usuarioDelToken(token);
        if ('datos' in r) setUsuario(r.datos);
        else await borrarToken();
      }
      setVerificando(false);
    });
  }, []);

  const aplicar = useCallback(async (r: Respuesta<Sesion>) => {
    if ('error' in r) return r.error;
    await guardarToken(r.datos.token);
    setUsuario(r.datos.usuario);
    return null;
  }, []);

  const ingresar = useCallback(
    async (correo: string, contrasena: string) => aplicar(await iniciarSesion(correo, contrasena)),
    [aplicar],
  );

  const crearCuenta = useCallback(
    async (nombre: string, correo: string, contrasena: string) => aplicar(await registrar(nombre, correo, contrasena)),
    [aplicar],
  );

  const salir = useCallback(async () => {
    await borrarToken();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, verificando, ingresar, crearCuenta, salir }),
    [usuario, verificando, ingresar, crearCuenta, salir],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSesion(): ContextoSesion {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useSesion debe usarse dentro de ProveedorSesion');
  return ctx;
}
