import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { guardarPreferencia, leerPreferencia } from '@/db/preferencias';
import { pedirPermisoNotificaciones } from '@/servicios/notificaciones';
import { esDeManana, minutosHasta } from '@/utils/tablas';

// Recordatorio "avisame 10 minutos antes del de las 7:15": notificación local programada en el teléfono.
const MINUTOS_ANTES = 10;
const CANAL = 'recordatorios';
const CLAVE = 'paran.recordatorios';

export type Recordatorio = {
  clave: string;
  lineaNumero: string;
  paradaNombre: string;
  hora: string;
  // Instante en que suena (ISO), para olvidar los que ya pasaron.
  suenaEn: string;
};

export type ResultadoRecordatorio = 'programado' | 'sin-permiso' | 'muy-tarde';

export const claveRecordatorio = (lineaId: string, paradaId: string, hora: string) => `${lineaId}|${paradaId}|${hora}`;

async function leer(): Promise<Recordatorio[]> {
  try {
    const texto = await leerPreferencia(CLAVE);
    const todos: Recordatorio[] = texto ? JSON.parse(texto) : [];
    return todos.filter((r) => new Date(r.suenaEn).getTime() > Date.now());
  } catch {
    return [];
  }
}

export async function recordatoriosActivos(): Promise<Recordatorio[]> {
  return leer();
}

export async function programarRecordatorio(datos: Omit<Recordatorio, 'suenaEn' | 'clave'> & { lineaId: string; paradaId: string }): Promise<ResultadoRecordatorio> {
  const ahora = new Date();
  const faltan = minutosHasta(datos.hora, ahora);
  if (faltan <= MINUTOS_ANTES) return 'muy-tarde';

  if ((await pedirPermisoNotificaciones()) !== 'concedido') return 'sin-permiso';

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Recordatorios de horario',
      importance: Notifications.AndroidImportance.HIGH,
    }).catch(() => {});
  }

  const suenaEn = new Date(ahora.getTime() + (faltan - MINUTOS_ANTES) * 60_000);
  const cuando = esDeManana(datos.hora, ahora) ? 'mañana' : 'hoy';
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Línea ${datos.lineaNumero} en ${MINUTOS_ANTES} minutos`,
      body: `Según la tabla pasa por ${datos.paradaNombre} a las ${datos.hora}.`,
      data: { paradaId: datos.paradaId },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: suenaEn, channelId: CANAL },
  });

  const recordatorio: Recordatorio = {
    clave: claveRecordatorio(datos.lineaId, datos.paradaId, datos.hora),
    lineaNumero: datos.lineaNumero,
    paradaNombre: datos.paradaNombre,
    hora: `${datos.hora} (${cuando})`,
    suenaEn: suenaEn.toISOString(),
  };
  await guardarPreferencia(CLAVE, JSON.stringify([...(await leer()), recordatorio]));
  return 'programado';
}
