import {
	Rubik_400Regular,
	Rubik_500Medium,
	Rubik_600SemiBold,
	Rubik_700Bold,
	useFonts,
} from '@expo-google-fonts/rubik';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { NavegacionCajon } from '@/componentes/Navegacion/NavegacionCajon';
import { RaizApp } from '@/componentes/Navegacion/RaizApp';

import { diagnosticoDb } from '../db';

SplashScreen.preventAutoHideAsync();

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
