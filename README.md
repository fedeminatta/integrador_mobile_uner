# Paran — Transporte público de Paraná

App móvil para los pasajeros de colectivos de Paraná: líneas y recorridos de ida y vuelta, paradas cercanas, próximos horarios según la tabla, avisos de desvíos y reportes de demora.

|  |  |
| --- | --- |
| Universidad | UNER — Universidad Nacional de Entre Ríos |
| Carrera | Tecnicatura Universitaria en Desarrollo Web |
| Materia | Desarrollo para Móviles — 2.º cuatrimestre 2026 |
| Trabajo | Trabajo Práctico Integrador |
| Grupo | 61 |

**Docentes**

- Prof. Titular: Lic. Franco Ruis Dias — [franco.ruisdias@uner.edu.ar](mailto:franco.ruisdias@uner.edu.ar)
- Jefe de Trabajos Prácticos: Lic. Germán Cueva — [german.cueva@uner.edu.ar](mailto:german.cueva@uner.edu.ar)

**Integrantes**

- Cristian Mateo Acuña
- Joaquín Arce
- Federico Minatta
- Vanesa Moreno
- Virginia Alejandra Ponce

---

## Probar la app

| | |
| --- | --- |
| **APK para Android** | *Link de descarga: se agrega cuando esté el build de EAS.* |
| **API publicada** | [paran-api-7n36.onrender.com/salud](https://paran-api-7n36.onrender.com/salud) |
| **Documentación de la API** | [paran-api-7n36.onrender.com/docs](https://paran-api-7n36.onrender.com/docs) |
| **Usuario de prueba** | `julian@mail.com` — contraseña `demo1234` |

La API corre en el plan gratuito de Render: después de 15 minutos sin uso se duerme y la primera carga tarda cerca de un minuto.

Para abrirla desde el código con Expo Go (SDK 57): `npm install`, `npx expo start --go` y escanear el QR desde la app Expo Go.

## Qué hace la app

- Líneas con su estado (normal, con desvío o suspendida), recorrido dibujado en el mapa y paradas en orden, por sentido.
- Paradas cercanas en el mapa, búsqueda por nombre o calle, filtro por línea y flecha con la brújula hacia la parada.
- Próximos colectivos según la tabla, con los minutos que faltan; aviso de "no hay más servicio hasta mañana" y horarios del día por tipo de día (hábil, sábado, domingo y feriado).
- Avisos de la Dirección de Transporte, con el recorrido alternativo del desvío en el mapa.
- Reportes de demora de los pasajeros y confirmación de los de otros.
- Favoritos y paradas recientes en el inicio, recordatorio "avisame 10 minutos antes" y compartir una parada.
- Registro e ingreso, sesión en `expo-secure-store` y desbloqueo con huella o rostro.
- Lector de QR de parada, aviso sin conexión, modo claro y oscuro.

| | |
| --- | --- |
| Framework | Expo SDK 57 + React Native 0.86 |
| Lenguaje | TypeScript |
| Navegación | Expo Router |
| Datos | API de la cátedra, `expo-sqlite` y `kv-store` |
| Mapas | `react-native-maps` + `expo-location` |

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

## API publicada (Render + Supabase)

La API de la cátedra está publicada con servicios gratuitos, así el APK funciona desde cualquier red:

| Pieza | Servicio |
| --- | --- |
| API (imagen Docker del repositorio de la cátedra) | Render, web service gratuito |
| Base de datos PostgreSQL | Supabase |
| Fotos y videos | Supabase Storage (bucket privado `archivos`) |

**Supabase**

1. Proyecto nuevo `paran-api`, región Americas.
2. **Connect** → cadena de conexión del *session pooler* (puerto `5432`, dominio `pooler.supabase.com`): es `DB_URL`, con la contraseña de la base reemplazada. La contraseña conviene que tenga solo letras y números.
3. **Storage** → bucket privado `archivos`.
4. **Storage → S3 Connection** → región y clave de acceso nueva (`Access key ID` y `Secret access key`).

**Render**

1. **New → Web Service → Public Git Repository**: `https://github.com/franco-ruisdias-uner/api-proyectos-mobile`.
2. Lenguaje **Docker**, plan **Free**, región Virginia (la misma que Supabase).
3. **Root Directory**: `api-transporte-publico`; **Dockerfile Path**: `Dockerfile`; **Docker Build Context Directory**: `.`.
4. **Health Check Path**: `/salud`.
5. Variables de entorno:

| Variable | Valor |
| --- | --- |
| `ENTORNO` | `publicado` |
| `CONFIAR_PROXY` | `true` |
| `DB_MOTOR` | `postgres` |
| `DB_PROVEEDOR` | `supabase` |
| `ARCHIVOS_PROVEEDOR` | `supabase` |
| `SEMBRAR_SI_VACIA` | `true` |
| `DB_SINCRONIZAR` | `true` |
| `NOTIFICACIONES` | `expo` |
| `DB_URL` | cadena del *session pooler* de Supabase |
| `SUPABASE_PROYECTO` | identificador del proyecto (`https://<identificador>.supabase.co`) |
| `S3_BUCKET` | `archivos` |
| `S3_REGION` | región de Supabase Storage |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | clave de acceso de Supabase Storage |
| `JWT_SECRETO` | generado por Render (botón **Generate**) |

Al primer deploy la API crea las tablas y carga los datos de demo. Para comprobarla: `https://paran-api-7n36.onrender.com/salud` responde `"estado": "ok"`.

Errores frecuentes al publicar:

| Error en los logs de Render | Solución |
| --- | --- |
| `open Dockerfile: no such file or directory` | Revisar *Root Directory* y *Dockerfile Path* |
| `password authentication failed` | La contraseña de `DB_URL` no coincide; restablecerla en Supabase sin símbolos |
| `Data type "datetime" ... not supported by "postgres"` | Falta `DB_MOTOR=postgres` |

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
