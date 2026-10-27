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
/**
 * Valida si la cadena obtenida por la cámara corresponde a un QR válido de parada.
 * Formato esperado: "PARANA-PARADA-<id>" o un objeto JSON con id de parada.
 */
export function obtenerParadaIdDeQR(codigoQr: string): string | null {
  if (!codigoQr) return null;
  
  const limpio = codigoQr.trim();
  
  // String directo "PARANA-PARADA-par-101" o "par-101"
  if (limpio.startsWith('PARANA-PARADA-')) {
    return limpio.replace('PARANA-PARADA-', '');
  }
  
  // El QR contiene un JSON, ej: {"paradaId": "par-101"}
  try {
    const parseado = JSON.parse(limpio);
    if (parseado && typeof parseado.paradaId === 'string') {
      return parseado.paradaId;
    }
  } catch {
    // No es JSON, continuar
  }

  // Si directamente viene el ID (ej "par-101")
  if (/^par-\d+$/.test(limpio)) {
    return limpio;
  }

  return null;
}

/**
 * Verifica si un aviso está activo en la fecha actual.
 */
export function esAvisoVigente(
  desdeIso: string,
  hastaIso: string | null,
  ahora: Date = new Date()
): boolean {
  const inicio = new Date(desdeIso).getTime();
  const actual = ahora.getTime();

  if (actual < inicio) return false;
  if (!hastaIso) return true; // Si no tiene fin, sigue vigente

  const fin = new Date(hastaIso).getTime();
  return actual <= fin;
}