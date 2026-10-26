#!/usr/bin/env bash
# Compila e instala el development build en Android.
#   scripts/android.sh emulador     -> inicia un emulador de Android Studio (si no hay uno) y abre la app
#   scripts/android.sh dispositivo  -> instala la app en un celular conectado por USB
# Variable opcional: AVD=<nombre> para elegir el emulador (por defecto, el primero de la lista).
set -euo pipefail

cd "$(dirname "$0")/.."
source scripts/entorno.sh

# Las tasks de VS Code no leen ~/.bashrc: se cargan nvm (entorno.sh) y se completan las variables si faltan.
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
if [ -z "${JAVA_HOME:-}" ]; then
  jdk="$(ls -d "$HOME"/.local/jdk/jdk-17* 2>/dev/null | head -n 1 || true)"
  [ -n "$jdk" ] && export JAVA_HOME="$jdk"
fi
[ -n "${JAVA_HOME:-}" ] && export PATH="$JAVA_HOME/bin:$PATH"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

error() {
  echo "✖ $1" >&2
  exit 1
}

case "${1:-}" in
  emulador | dispositivo) ;;
  *) error "Uso: scripts/android.sh emulador|dispositivo" ;;
esac

command -v java >/dev/null || error "No se encontró Java 17. Ver "En el emulador de Android" en INSTALACION.md."
[ -d "$ANDROID_HOME" ] || error "No existe el Android SDK en $ANDROID_HOME. Abrir Android Studio y completar el asistente inicial."
command -v adb >/dev/null || error "Falta 'Android SDK Platform-Tools'. Instalar desde Android Studio → Settings → Android SDK → SDK Tools."

adb start-server >/dev/null

emulador() {
  command -v emulator >/dev/null || error "Falta 'Android Emulator'. Instalar desde Android Studio → Settings → Android SDK → SDK Tools."

  if adb devices | grep -q '^emulator-.*device$'; then
    echo "✔ Ya hay un emulador corriendo."
  else
    local avd="${AVD:-$(emulator -list-avds | head -n 1)}"
    [ -n "$avd" ] || error "No hay emuladores creados. Crear uno en Android Studio → Device Manager."

    echo "▶ Iniciando el emulador '$avd'..."
    nohup emulator -avd "$avd" -netdelay none -netspeed full >/dev/null 2>&1 &

    echo "… Esperando que termine de arrancar (puede tardar 1-2 minutos)"
    adb wait-for-device
    until [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
      sleep 2
    done
    echo "✔ Emulador listo."
  fi

  npx expo run:android
}

dispositivo() {
  local fisicos
  fisicos="$(adb devices | grep -v '^emulator-' | grep -c 'device$' || true)"
  if [ "$fisicos" -eq 0 ]; then
    if adb devices | grep -q 'unauthorized$'; then
      error "El celular está conectado pero no autorizado: aceptar el cartel 'Permitir depuración USB' en la pantalla."
    fi
    error "No hay ningún celular conectado. Conectarlo por USB con la depuración USB activada (Opciones de desarrollador)."
  fi

  # Desinstala la versión anterior para arrancar limpio (sin datos viejos ni firmas que no coinciden).
  local paquete
  paquete="$(node -p "require('./app.json').expo.android.package")"
  for serial in $(adb devices | grep -v '^emulator-' | awk '$2 == "device" { print $1 }'); do
    echo "▶ Desinstalando $paquete de $serial..."
    adb -s "$serial" uninstall "$paquete" >/dev/null 2>&1 || echo "  (no estaba instalada)"
  done

  # --device muestra la lista para elegir el celular si también hay un emulador abierto.
  npx expo run:android --device
}

"$1"
