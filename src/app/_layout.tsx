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

import { diagnosticoDb } from '../db';

SplashScreen.preventAutoHideAsync();

// Avisos esperados en desarrollo: Expo Go no soporta notificaciones push (la app usa solo locales)
// y sin EXPO_PUBLIC_API_URL la app usa a propósito los datos de prueba.
LogBox.ignoreLogs(['expo-notifications', 'Push notifications (remote notifications)', 'Falta EXPO_PUBLIC_API_URL']);

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
		diagnosticoDb().then(console.log).catch(console.error);
	}, []);

	if (!listo) return null;

	return (
		<RaizApp>
			<NavegacionCajon />
		</RaizApp>
	);
}
