# Instalación

Expo SDK 57 (React Native 0.86, React 19, TypeScript, Expo Router) con npm.

## Requisitos

| Herramienta | Versión | Uso |
| --- | --- | --- |
| Git | reciente | clonar el repositorio |
| Node.js | 22 LTS (o 20.19+) | Expo y Metro |
| Expo Go | última versión | ejecutar en un celular |
| JDK | 17 | emulador y development build de Android |
| Android Studio | Android 16 (API 36) | emulador de Android |

## 1. Node.js

Linux / macOS, con nvm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

En una terminal nueva:

```bash
nvm install 22
```

Windows: instalar [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) y ejecutar `nvm install 22` y `nvm use 22`.

## 2. Dependencias

```bash
git clone <url-del-repo> integrador_mobile_uner
```

```bash
cd integrador_mobile_uner
```

```bash
npm install
```

```bash
npx expo-doctor
```

Si `expo-doctor` informa versiones incompatibles:

```bash
npx expo install --fix
```

Los paquetes nuevos se agregan con `npx expo install <paquete>`.

## 3. Ejecutar la app

### En un celular con Expo Go

```bash
npx expo start
```

Escanear el QR con Expo Go (Android) o con la cámara (iPhone). El celular y la computadora tienen que estar en la misma red; si la red bloquea la conexión:

```bash
npx expo start --tunnel
```

### En el emulador de Android

1. Instalar OpenJDK 17:

   ```bash
   sudo apt install openjdk-17-jdk
   ```

   Sin `sudo`: descomprimir Temurin 17 (https://adoptium.net) en `~/.local/jdk/`.

2. Instalar [Android Studio](https://developer.android.com/studio) y, en *Settings → Languages & Frameworks → Android SDK*, agregar:
   - *SDK Platforms*: Android SDK Platform 36 y Sources for Android 36.
   - *SDK Tools*: Android SDK Build-Tools, Android Emulator y Android SDK Platform-Tools.

3. Agregar las variables de entorno a `~/.bashrc` (en macOS el SDK está en `~/Library/Android/sdk`):

   ```bash
   echo 'export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH' >> ~/.bashrc
   ```

   Si el JDK está en `~/.local/jdk` (ajustar la versión de la carpeta):

   ```bash
   echo 'export JAVA_HOME=$HOME/.local/jdk/jdk-17.0.21+9
   export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
   ```

   En Windows: `ANDROID_HOME = %LOCALAPPDATA%\Android\Sdk` en las variables de entorno del sistema.

4. Comprobar en una terminal nueva:

   ```bash
   adb --version
   ```

5. Crear un dispositivo virtual en *Device Manager* (por ejemplo, Pixel con API 36).

### Development build

Compila e instala la app en el emulador o en un celular conectado por USB con depuración USB activada:

```bash
npx expo run:android
```

Con el script del proyecto, que inicia el emulador si hace falta:

```bash
./scripts/android.sh emulador
```

```bash
./scripts/android.sh dispositivo
```

`AVD=<nombre>` elige el emulador (`emulator -list-avds` muestra los disponibles).

Con la app ya instalada, alcanza con `npx expo start`. Hay que volver a compilar al agregar una librería nativa o cambiar `app.json`.

Versión release, sin Metro:

```bash
npx expo run:android --variant release
```

## Problemas comunes

| Problema | Solución |
| --- | --- |
| El celular no conecta con Metro | Misma red, o `npx expo start --tunnel` |
| Errores después de cambiar dependencias | `npx expo start --clear` |
| `expo-doctor` informa versiones incompatibles | `npx expo install --fix` |
| `adb: command not found` | Revisar `ANDROID_HOME` y `PATH` |
| `configs.toReversed is not a function` | Node viejo: `nvm use 22` |
| Linux: `ENOSPC: System limit for number of file watchers` | `echo fs.inotify.max_user_watches=524288 \| sudo tee -a /etc/sysctl.conf && sudo sysctl -p` |
