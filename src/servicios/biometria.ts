import * as LocalAuthentication from 'expo-local-authentication';

export async function hayBiometriaDisponible(): Promise<boolean>{
    try{
        const [hayHardware, inscripto] = await Promise.all([
            LocalAuthentication.hasHardwareAsync(),
            LocalAuthentication.isEnrolledAsync(),
        ]);
        return hayHardware && inscripto;
    } catch {
        return false;
    }
}

export type ResultadoDesbloqueo =
    | {ok: true }
    | {ok: false; cancelo: true }
    | {ok: false; cancelo: false; mensaje: string };

export async function desbloquearConBiometria(): Promise<ResultadoDesbloqueo> {
    try{
        const resultado= await LocalAuthentication.authenticateAsync({
            promptMessage: 'Desbloquea tu sesion',
            promptSubtitle: 'Confirma que sos vos',
            cancelLabel: 'Cancelar',
            fallbackLabel: 'Usar clave del telefono',
            requireConfirmation: false,
        });
        if (resultado.success) return {ok: true};
        if(
            resultado.error ==='user_cancel' ||
            resultado.error ==='system_cancel' ||
            resultado.error ==='app_cancel' 
        ) {
            return {ok: false, cancelo: true };
        }
        if (resultado.error === 'lockout') {
            return {
                ok:false,
                cancelo: false,
                mensaje: 'Demasiados intentos fallidos. Esperá un momento y próba de nuevo' ,
            };
        }
        return { ok: false, cancelo: false, mensaje: 'No pudimos confirmar tu identidad. Probá de nuevo.' };
    } catch {
            return { ok: false, cancelo: false, mensaje: 'No pudimos abrir el desbloqueo biometrico. Probá de nuevo' };
        }
}