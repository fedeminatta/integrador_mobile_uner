# Carga el Node.js correcto para las tasks de VS Code (usar con `source scripts/entorno.sh`).
# Las tasks no leen ~/.bashrc, así que sin esto se usa el Node del sistema (p. ej. /usr/bin/node v18),
# que Expo SDK 57 no soporta.

# VS Code instalado como snap (Ubuntu) les pasa a las tasks variables de GTK/GIO/XDG que apuntan a su
# propio sandbox. Con ellas `xdg-open` no abre bien el navegador (sobre todo si también es snap, como
# Brave, Firefox o Chromium) y el emulador puede fallar. El snap guarda los valores originales en
# <VARIABLE>_VSCODE_SNAP_ORIG: se restauran, y si no están se descarta lo que apunte a /snap/code.
for var in XDG_CONFIG_DIRS XDG_DATA_DIRS LOCPATH GIO_MODULE_DIR GSETTINGS_SCHEMA_DIR GDK_PIXBUF_MODULE_FILE \
  GDK_PIXBUF_MODULEDIR GDK_BACKEND GTK_PATH GTK_EXE_PREFIX GTK_IM_MODULE_FILE; do
  if eval "[ -n \"\${${var}_VSCODE_SNAP_ORIG+x}\" ]"; then
    eval "orig=\"\${${var}_VSCODE_SNAP_ORIG}\""
    case "$orig" in
      '' | "''") unset "$var" ;;
      *) export "$var=$orig" ;;
    esac
    unset "${var}_VSCODE_SNAP_ORIG"
  fi
  eval "valor=\"\${${var}-}\""
  case "$valor" in
    *"/snap/code"*)
      case "$var" in
        XDG_*) export "$var=$(printf '%s' "$valor" | tr ':' '\n' | grep -v '/snap/code' | paste -sd ':' -)" ;;
        *) unset "$var" ;;
      esac
      ;;
  esac
done
unset var orig valor

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh"
fi

if ! command -v node >/dev/null; then
  echo "✖ No se encontró Node.js. Ver INSTALACION.md, sección 1." >&2
  return 1 2>/dev/null || exit 1
fi

if ! node -e 'const [a, b] = process.versions.node.split(".").map(Number); process.exit(a > 20 || (a === 20 && b >= 19) ? 0 : 1)'; then
  echo "✖ Node.js $(node -v) es muy viejo para Expo SDK 57 (se necesita 20.19+, recomendado 22)." >&2
  echo "  Instalar con: nvm install 22 && nvm alias default 22  (ver INSTALACION.md, sección 1)." >&2
  return 1 2>/dev/null || exit 1
fi
