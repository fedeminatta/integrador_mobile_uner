import { router, Stack } from 'expo-router';

import { Boton } from '@/componentes/Boton/Boton';
import { GrupoBotones } from '@/componentes/Boton/GrupoBotones';
import { Notificacion } from '@/componentes/Notificacion/Notificacion';
import { Pantalla, Seccion } from '@/componentes/Pantalla/Pantalla';
import { Tarjeta } from '@/componentes/Tarjeta/Tarjeta';
import { Texto } from '@/componentes/Texto/Texto';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useSesion } from '@/hooks/useSesion';
import { usaDatosDePrueba } from '@/servicios/red';

export default function Yo() {
  const { usuario, salir } = useSesion();
  const favoritos = useFavoritos();
  const cantidad = favoritos.lineas.length + favoritos.paradas.length;

  const cerrarSesion = async () => {
    await salir();
    router.navigate('/');
  };

  return (
    <Pantalla>
      <Stack.Screen options={{ title: 'Yo' }} />

      <Seccion titulo="Mi cuenta">
        {usuario ? (
          <Tarjeta>
            <Texto variante="destacado">{usuario.nombre}</Texto>
            <Texto variante="chico">Con tu cuenta puedes reportar demoras y confirmar las de otros pasajeros.</Texto>
          </Tarjeta>
        ) : (
          <>
            <Notificacion tipo="info" titulo="Estás usando la app sin cuenta" mensaje="Puedes ver líneas, paradas y horarios. Para reportar demoras hace falta iniciar sesión." />
            <GrupoBotones>
              <Boton texto="Iniciar sesión" icono="log-in-outline" onPress={() => router.push('/login')} />
              <Boton texto="Crear cuenta" variante="secundario" icono="person-add-outline" onPress={() => router.push('/registro')} />
            </GrupoBotones>
          </>
        )}
      </Seccion>

      <Seccion titulo="Lo mío">
        <GrupoBotones>
          <Boton
            texto={cantidad ? `Favoritos (${cantidad})` : 'Favoritos'}
            variante="secundario"
            icono="star-outline"
            onPress={() => router.push('/favoritos')}
          />
          <Boton texto="Tema y vibración" variante="secundario" icono="settings-outline" onPress={() => router.push('/ajustes')} />
        </GrupoBotones>
      </Seccion>

      {usaDatosDePrueba && (
        <Notificacion tipo="info" titulo="Datos de prueba" mensaje="La app no tiene configurada la dirección de la API: las líneas y horarios son de ejemplo." />
      )}

      {usuario && <Boton texto="Cerrar sesión" variante="peligro" icono="log-out-outline" onPress={cerrarSesion} />}
    </Pantalla>
  );
}
