import * as Haptics from 'expo-haptics';
import { useCallback, useMemo } from 'react';
import { Platform } from 'react-native';

import { usePreferencias } from '@/hooks/usePreferencias';

// Vibraciones cortas que respetan la preferencia del usuario.
export function useHaptica() {
  const { haptica } = usePreferencias();
  const activa = haptica && Platform.OS !== 'web';

  const toque = useCallback(() => {
    if (activa) Haptics.selectionAsync().catch(() => {});
  }, [activa]);

  const exito = useCallback(() => {
    if (activa) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [activa]);

  const error = useCallback(() => {
    if (activa) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  }, [activa]);

  return useMemo(() => ({ toque, exito, error }), [toque, exito, error]);
}
