# Paran — Transporte público de Paraná

App móvil para los pasajeros de colectivos de Paraná: líneas y recorridos de ida y vuelta, paradas cercanas, próximos horarios según la tabla, avisos de desvíos y reportes de demora.

Trabajo Práctico Integrador de Desarrollo para Móviles (UNER, 2026).

| | |
| --- | --- |
| Framework | Expo SDK 57 + React Native 0.86 |
| Lenguaje | TypeScript |
| Navegación | Expo Router |
| Datos | API de la cátedra, `expo-sqlite` y `kv-store` |

## Instalación

Requisitos y configuración del entorno (Node, Android Studio, emulador): [INSTALACION.md](INSTALACION.md).

```bash
npm install
```

## Ejecutar la app

### En el celular con Expo Go

```bash
npx expo start --go
```

Abrir Expo Go en el celular y escanear el QR con la opción **Scan QR code** de la app. El celular y la computadora tienen que estar en la misma red.

Para ver y grabar la pantalla del celular en la computadora (celular conectado por USB con la depuración USB activada):

```bash
scrcpy --record demo.mp4
```

### Development build (emulador o celular por USB)

```bash
./scripts/android.sh emulador
```

```bash
./scripts/android.sh dispositivo
```

Después de agregar una librería nativa o cambiar `app.json`, regenerar la carpeta `android/`:

```bash
npx expo prebuild --clean --platform android
```

## APK con EAS (build en la nube)

El build corre en los servidores de Expo y genera un APK que se instala sin Metro. Requiere una cuenta gratuita en [expo.dev](https://expo.dev).

```bash
npx eas-cli login
```

La primera vez, vincular el proyecto con la cuenta:

```bash
npx eas-cli init
```

Cargar la clave de Google Maps (una sola vez). Sin esta clave el mapa se ve negro en el APK:

```bash
npx eas-cli env:create --name GOOGLE_MAPS_API_KEY --value <clave> --environment preview --visibility sensitive
```

Generar el APK de entrega:

```bash
npx eas-cli build --platform android --profile preview
```

Al terminar, EAS muestra un link para descargar e instalar el APK. El cupo mensual de builds gratuitos es limitado: hacer el build solo cuando haga falta.

Para usar la clave de Google Maps en un development build local, agregar `GOOGLE_MAPS_API_KEY=<clave>` en `.env.local`.

## Configurar la API

La app usa la API publicada en `https://paran-api-7n36.onrender.com` (archivo `.env`). Para usar otra, crear `.env.local` en la raíz del proyecto (no se sube al repositorio):

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```

| Dónde corre la app | Valor de `EXPO_PUBLIC_API_URL` |
| --- | --- |
| Celular en la misma red | `http://<IP de la computadora>:3000` |
| Emulador de Android | `http://10.0.2.2:3000` |
| API publicada | `https://paran-api-7n36.onrender.com` |
| Sin API (datos de prueba) | vacío: `EXPO_PUBLIC_API_URL=` |

Con la variable vacía, líneas, paradas, horarios y reportes se muestran con datos de prueba que usan los mismos ids que la API (`lin-05`, `par-101`, `avi-088`).

IP de la computadora:

- Linux: `hostname -I`
- Windows: `ipconfig` (dirección IPv4 del adaptador de red)

Después de cambiar `.env.local`, reiniciar Metro con `npx expo start --go -c`.

Para comprobar la conexión, abrir `<EXPO_PUBLIC_API_URL>/salud` en el navegador del celular: tiene que responder `"estado": "ok"`. La documentación de los endpoints está en `<EXPO_PUBLIC_API_URL>/docs`.

## Levantar la API en la computadora (Docker)

```bash
git clone --filter=blob:none --sparse https://github.com/franco-ruisdias-uner/api-proyectos-mobile.git
```

```bash
cd api-proyectos-mobile
```

```bash
git sparse-checkout set api-transporte-publico
```

```bash
cd api-transporte-publico
```

```bash
docker compose up -d
```

Comprobar que responde:

```bash
curl http://localhost:3000/lineas
```

En Windows (PowerShell): `Invoke-RestMethod http://localhost:3000/lineas`.

Usuarios de prueba (contraseña `demo1234`):

| Email | Para qué sirve |
| --- | --- |
| `julian@mail.com` | Pasajero con favoritos y reportes |
| `nuevo@demo.ar` | Cuenta vacía, para ver las listas sin datos |

## Estructura

```
src/
├── app/          # pantallas (Expo Router)
│   ├── (tabs)/   # inicio, líneas, paradas y avisos
│   └── (detalle)/ # línea, parada, aviso, reportar, favoritos y Yo
├── componentes/  # componentes de la app
├── servicios/    # acceso a la API (con datos de prueba si no hay API)
├── hooks/        # sesión, favoritos, red, permisos, brújula...
├── db/           # SQLite, kv-store y secure-store
├── tipos/        # tipos del PRD y de la API
├── mocks/        # datos de prueba
├── utils/        # horarios, distancias, fechas, validaciones
└── tema/         # colores claro/oscuro y medidas
```

## Antes de subir cambios

```bash
npx expo lint
```

```bash
npx tsc --noEmit
```

## Recursos

- [Documentación de Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo Go](https://expo.dev/go)
