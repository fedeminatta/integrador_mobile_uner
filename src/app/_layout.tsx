import {
	Rubik_400Regular,
	Rubik_500Medium,
	Rubik_600SemiBold,
	Rubik_700Bold,
	useFonts,
} from '@expo-google-fonts/rubik';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { LogBox } from 'react-native';

import { NavegacionCajon } from '@/componentes/Navegacion/NavegacionCajon';
import { RaizApp } from '@/componentes/Navegacion/RaizApp';
import { sincronizarCatalogo } from '@/servicios/sincronizacion';

SplashScreen.preventAutoHideAsync();

// Avisos esperados en desarrollo: Expo Go no soporta notificaciones push (la app usa solo locales)
// y sin EXPO_PUBLIC_API_URL la app usa a propósito los datos de prueba.
LogBox.ignoreLogs([
	'expo-notifications',
	'Push notifications (remote notifications)',
	'Falta EXPO_PUBLIC_API_URL',
]);

export default function Layout() {
	const [fuentesListas, errorFuentes] = useFonts({
		Rubik_400Regular,
		Rubik_500Medium,
		Rubik_600SemiBold,
		Rubik_700Bold,
	});
	const listo = fuentesListas || !!errorFuentes;

	useEffect(() => {
		if (listo) SplashScreen.hideAsync();
	}, [listo]);

	useEffect(() => {
		// Baja el catálogo (líneas, paradas, horarios, feriados) a SQLite para que la app
		// funcione sin conexión. Si falla (sin red, API apagada), no bloquea el arranque:
		// useRed.ts reintenta en cuanto detecta que volvió la conexión.
		sincronizarCatalogo().catch(() => {});
	}, []);

	if (!listo) return null;

	return (
		<RaizApp>
			<NavegacionCajon />
		</RaizApp>
	);
}
