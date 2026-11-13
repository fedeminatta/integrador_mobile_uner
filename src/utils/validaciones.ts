// Devuelven el mensaje de error o null si el valor es válido.

export function validarCorreo(correo: string): string | null {
  const limpio = correo.trim();
  if (!limpio) return 'Escribe tu correo.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) {
    return 'El correo no tiene un formato válido, por ejemplo nombre@correo.com.';
  }
  return null;
}

export const LARGO_MINIMO_CONTRASENA = 6;

export function validarContrasenaNueva(contrasena: string): string | null {
  if (!contrasena) return 'Elige una contraseña.';
  if (contrasena.length < LARGO_MINIMO_CONTRASENA) {
    return `Usa al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`;
  }
  return null;
}

export function validarNombre(nombre: string): string | null {
  return nombre.trim() ? null : 'Escribe tu nombre.';
}

/**
 * Valida si la cadena leída por la cámara corresponde al QR oficial de parada ("PARANA:par-xxx").
 */
export function esQrDeParadaValido(codigoQr: string): boolean {
  if (!codigoQr) return false;
  return /^PARANA:par-[\w-]+$/.test(codigoQr.trim());
}

/**
 * Extrae el ID de parada ("par-xxx") desde un QR válido, o null si es inválido.
 */
export function obtenerParadaIdDeQR(codigoQr: string): string | null {
  const limpio = codigoQr.trim();
  if (!esQrDeParadaValido(limpio)) return null;
  return limpio.replace('PARANA:', '');
}

/**
 * Verifica si un aviso está vigente en el momento indicado.
 */
export function esAvisoVigente(
  desdeIso: string,
  hastaIso: string | null,
  ahora: Date = new Date()
): boolean {
  const inicio = new Date(desdeIso).getTime();
  const actual = ahora.getTime();
  if (actual < inicio) return false;
  if (!hastaIso) return true;
  return actual <= new Date(hastaIso).getTime();
}