import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { guardarPreferencia, leerPreferencia } from '@/db/preferencias';
import type { EstadoPermiso } from '@/hooks/usePermisos';
import type { AvisoVista } from '@/servicios/avisosApi';

const CLAVE_AVISOS_NOTIFICADOS = 'avisos-notificados';
const CANAL_AVISOS = 'avisos';

//sin handler, la notificacion con la app abierta NO se muestra.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


async function asegurarCanal(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(CANAL_AVISOS, {
      name: 'Avisos de la línea',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 200, 100, 200],
      lightColor: '#D9534F',
    });
  } catch {
    
  }
}

function estadoDe(r: { granted: boolean; status: string; canAskAgain?: boolean }): EstadoPermiso {
  if (r.granted) return 'concedido';
  if (r.status === 'undetermined') return 'sin-determinar';
  return r.canAskAgain === false ? 'bloqueado' : 'denegado';
}

/** Estado actual SIN pedir nada. */
export async function permisoNotificaciones(): Promise<EstadoPermiso> {
  try {
    return estadoDe(await Notifications.getPermissionsAsync());
  } catch {
    return 'denegado';
  }
}


export async function pedirPermisoNotificaciones(): Promise<EstadoPermiso> {
  await asegurarCanal();
  try {
    return estadoDe(await Notifications.requestPermissionsAsync());
  } catch {
    return 'denegado';
  }
}

let avisando = false; 

/*** Una notificacion local por aviso nuevo */
export async function avisarAvisosNuevos(avisos: AvisoVista[]): Promise<void> {
  if (avisando) return;
  avisando = true;
  try {
    if ((await permisoNotificaciones()) !== 'concedido') return;
    const guardado = await leerPreferencia(CLAVE_AVISOS_NOTIFICADOS);
    const yaVistos: string[] = guardado ? JSON.parse(guardado) : [];
    const vistos = new Set(yaVistos);
    const nuevos = avisos.filter((a) => !vistos.has(a.id));
    if (!nuevos.length) return;
    await asegurarCanal();
    for (const a of nuevos) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title: a.titulo, body: a.detalle, data: { avisoId: a.id } },
      trigger: null,
    });
  } catch {
    
  }
}
    await guardarPreferencia(
      CLAVE_AVISOS_NOTIFICADOS,
      JSON.stringify([...yaVistos, ...nuevos.map((a) => a.id)]),
    );
  } catch {
    
  } finally {
    avisando = false;
  }
}