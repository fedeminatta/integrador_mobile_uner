import { CameraView } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Boton } from '@/componentes/Boton/Boton';
import { Dialogo } from '@/componentes/Dialogo/Dialogo';
import { EstadoVacio } from '@/componentes/Estados/Estados';
import { InsigniaLinea } from '@/componentes/InsigniaLinea/InsigniaLinea';
import { Notificacion } from '@/componentes/Notificacion/Notificacion';
import { Texto } from '@/componentes/Texto/Texto';
import { useHaptica } from '@/hooks/useHaptica';
import { usePermisos } from '@/hooks/usePermisos';
import { paradaPorQr } from '@/servicios/paradasApi';
import { Parada } from '@/tipos/types';
import { esQrDeParadaValido } from '@/utils/validaciones';

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#000' },
  marco: {
    position: 'absolute',
    top: '28%',
    alignSelf: 'center',
    width: 260,
    height: 260,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  aviso: { position: 'absolute', top: 16, left: 16, right: 16 },
  datos: { gap: 8, alignItems: 'center', marginTop: 8 },
  lineas: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  permisos: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
});

export default function Escanear() {
  const { estados, pedir, abrirAjustes } = usePermisos();
  const haptica = useHaptica();

  const [avisos, setAvisos] = useState<{ tipo: 'aviso' | 'error'; titulo: string; mensaje?: string } | null>(null);
  const [parada, setParada] = useState<Parada | null>(null);
  const [cargando, setCargando] = useState(false);
  const escaneandoRef = useRef(false);

  const manejarEscaneo = async (r: { data: string }) => {
    if (escaneandoRef.current) return;
    if (!esQrDeParadaValido(r.data)) {
      haptica.error?.();
      setAvisos({ tipo: 'aviso', titulo: 'Ese QR no es de una parada', mensaje: 'Escaneá el QR de la parada de Paraná.' });
      return;
    }
    escaneandoRef.current = true;
    setCargando(true);
    const res = await paradaPorQr(r.data);
    setCargando(false);
    if ('error' in res) {
      haptica.error?.();
      setAvisos({ tipo: 'error', titulo: 'No pudimos buscar la parada', mensaje: res.error.mensaje });
      escaneandoRef.current = false;
      return;
    }
    haptica.exito?.();
    setParada(res.datos);
  };

  const escanearOtro = () => { setParada(null); setAvisos(null); escaneandoRef.current = false; };

  // --- Estados de permiso ---
  if (estados.camara === 'sin-determinar') {
    return (
      <VistaPermisos
        titulo="Necesitamos la cámara"
        mensaje="Para escanear el QR de la parada."
        acciones={<Boton texto="Permitir cámara" icono="camera" onPress={() => pedir('camara')} />}
      />
    );
  }
  if (estados.camara === 'denegado') {
    return (
      <VistaPermisos
        titulo="Cámara bloqueada"
        mensaje="Activá el permiso para escanear el QR."
        acciones={<Boton texto="Intentar de nuevo" variante="secundario" icono="refresh" onPress={() => pedir('camara')} />}
      />
    );
  }
  if (estados.camara === 'bloqueado') {
    return (
      <VistaPermisos
        titulo="Permiso desactivado"
        mensaje="El permiso de cámara está bloqueado. Abrí Ajustes para activarlo."
        acciones={<Boton texto="Abrir ajustes" variante="secundario" icono="settings" onPress={abrirAjustes} />}
      />
    );
  }

  // --- Cámara ---
  return (
    <View style={estilos.contenedor}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={manejarEscaneo}
      />
      {/* Marco/ventana del QR encima de la cámara */}
      <View style={estilos.marco} pointerEvents="none" />

      {!!avisos && (
        <View style={estilos.aviso}>
          <Notificacion
            tipo={avisos.tipo}
            titulo={avisos.titulo}
            mensaje={avisos.mensaje}
            onCerrar={() => setAvisos(null)}
          />
        </View>
      )}

      <Dialogo
        visible={!!parada}
        titulo={parada?.nombre ?? ''}
        icono="location"
        onCerrar={escanearOtro}
        acciones={[
          { texto: 'Escanear otro', variante: 'secundario', onPress: escanearOtro },
          {
            texto: 'Ver parada',
            onPress: () => {
              const id = parada?.id;
              escanearOtro();
              if (id) router.replace(`/parada/${id}`);
            },
          },
        ]}
      >
        {parada && (
          <View style={estilos.datos}>
            <View style={estilos.lineas}>
              {parada.lineaIds.map((id) => (
                <InsigniaLinea key={id} numero={id.replace('lin-', '')} chica />
              ))}
            </View>
            <Texto variante="chico">
              Sentido {parada.sentido}{parada.refugio ? ' · Con refugio' : ' · Sin refugio'}
            </Texto>
          </View>
        )}
      </Dialogo>

      {cargando && (
        <View style={estilos.aviso}>
          <Notificacion tipo="info" titulo="Buscando la parada…" />
        </View>
      )}
    </View>
  );
}

function VistaPermisos({ titulo, mensaje, acciones }: { titulo: string; mensaje: string; acciones: ReactNode }) {
  return (
    <View style={estilos.permisos}>
      <EstadoVacio icono="camera-outline" titulo={titulo} mensaje={mensaje} />
      {acciones}
    </View>
  );
}