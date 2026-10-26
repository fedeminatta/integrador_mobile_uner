// Devuelven el mensaje de error o null si el valor es válido.

export function validarCorreo(correo: string): string | null {
  const limpio = correo.trim();
  if (!limpio) return 'Escribe tu correo.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) return 'El correo no tiene un formato válido, por ejemplo nombre@correo.com.';
  return null;
}

export const LARGO_MINIMO_CONTRASENA = 6;

export function validarContrasenaNueva(contrasena: string): string | null {
  if (!contrasena) return 'Elige una contraseña.';
  if (contrasena.length < LARGO_MINIMO_CONTRASENA) return `Usa al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`;
  return null;
}

export function validarNombre(nombre: string): string | null {
  return nombre.trim() ? null : 'Escribe tu nombre.';
}
