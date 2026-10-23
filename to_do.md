# 🚌 Paran — App de Transporte Público de Paraná

> Plan de trabajo del TPI de Desarrollo para Móviles (UNER, 2do cuatrimestre 2026).
> Cliente: Silvina Ferreyra, Dirección de Transporte de Paraná.
> Stack: React Native + Expo (Expo Router), TypeScript, StyleSheet, build con EAS.

Para tachar objetivos: cambiar `- [ ]` por `- [x]`.

---

## 1. Resumen en 5 líneas

- La app le dice al pasajero **qué líneas hay, qué paradas tiene cerca, a qué hora pasa cada una según la tabla** y si hoy hay un **desvío**.
- **No hay GPS en los colectivos**: nunca decir "llega en 3 min", siempre "según la tabla, 10:42".
- Tiene que **funcionar sin datos** (recorridos y horarios guardados en el teléfono). Los avisos y reportes necesitan red, y la app tiene que **decir cuándo lo que muestra está viejo**.
- Un solo tipo de usuario (pasajero). Mirar no requiere cuenta; la cuenta sirve para reportar y guardar favoritos.
- Se construye contra **datos mock** hasta que la cátedra publique la API.

---

## 2. Mapa de pantallas

### Navegación (Expo Router)

```
app/
├── _layout.tsx                  # providers, chequeo de sesión, red
├── (auth)/
│   ├── login.tsx
│   ├── registro.tsx
│   └── desbloqueo.tsx           # huella / rostro / PIN alternativo
├── (tabs)/
│   ├── _layout.tsx              # barra inferior
│   ├── index.tsx                # INICIO: favoritos + avisos + mapa cercano
│   ├── lineas.tsx               # listado de las 14 líneas
│   ├── paradas.tsx              # mapa + lista de paradas cercanas + búsqueda
│   ├── avisos.tsx               # avisos vigentes
│   └── yo.tsx                   # cuenta, favoritos, preferencias
├── linea/[id].tsx               # detalle de línea (ida/vuelta, mapa, paradas, aviso)
├── parada/[id].tsx              # próximos horarios + reportes + favorito
├── aviso/[id].tsx               # detalle del aviso (mapa alternativo + video)
├── reportar/[paradaId].tsx      # crear reporte de demora
├── escanear.tsx                 # lector de QR de parada
├── favoritos.tsx
└── ajustes.tsx                  # tema, avisos, recordatorios
```

### Lista de pantallas

| #   | Pantalla          | Para qué                                                                                         | Datos que usa                     |
| --- | ----------------- | ------------------------------------------------------------------------------------------------ | --------------------------------- |
| 1   | Login / Registro  | Crear cuenta y entrar                                                                            | Usuario                           |
| 2   | Desbloqueo        | Reingreso con huella/rostro (con alternativa)                                                    | token en secure-store             |
| 3   | Inicio            | Favoritos primero, avisos de hoy, mapa y paradas cercanas                                        | Parada, Horario, Aviso            |
| 4   | Líneas            | Listado con número, color, nombre y estado (normal / desvío)                                     | Linea, Aviso                      |
| 5   | Detalle de línea  | Aviso arriba, selector ida/vuelta, recorrido en mapa, paradas en orden, horarios por tipo de día | Linea, Recorrido, Parada, Horario |
| 6   | Paradas           | Mapa con paradas cercanas, lista por distancia, búsqueda, flecha                                 | Parada                            |
| 7   | Detalle de parada | Líneas que paran, próximos 3 horarios, reportes recientes, botón reportar                        | Parada, Horario, ReporteDeDemora  |
| 8   | Avisos            | Lista de avisos vigentes                                                                         | Aviso                             |
| 9   | Detalle de aviso  | Texto, desde/hasta, recorrido alternativo, video                                                 | Aviso                             |
| 10  | Reportar demora   | Motivo, comentario, foto                                                                         | ReporteDeDemora                   |
| 11  | Escanear QR       | Abre directo la parada                                                                           | Parada.codigoQr                   |
| 12  | Favoritos         | Líneas y paradas guardadas                                                                       | Usuario                           |
| 13  | Yo / Ajustes      | Cuenta, tema, avisos, recordatorios, cerrar sesión                                               | Usuario                           |

---

## 3. Wireframes

### Inicio

```
+-----------------------------------+
| Paran                       [ QR ]|
+-----------------------------------+
| (!) Sin conexión · datos de hace 2h|  <- solo si está offline / viejo
+-----------------------------------+
| Tus paradas                       |
| * Alameda y Urquiza        120 m  |
|   L5   10:42  11:02  11:22        |
|   L14  10:51  11:21  11:51        |
+-----------------------------------+
| Avisos de hoy                     |
| ! L2 L7 L9 - Desvío calle Corrientes|
+-----------------------------------+
|                                   |
|        M A P A de paradas         |
|            (o) vos                |
|                                   |
+-----------------------------------+
| [Inicio][Líneas][Paradas][Avisos][Yo]|
+-----------------------------------+
```

### Detalle de línea

```
+-----------------------------------+
| < Línea 5 - Puerto Viejo      [*] |
+-----------------------------------+
| ! Desvío por obra · ver aviso >   |  <- siempre visible acá
+-----------------------------------+
| [ Ida ]  [ Vuelta ]               |
| hacia Puerto Viejo                |
+-----------------------------------+
|     MAPA con el trazado           |
+-----------------------------------+
| Paradas (en orden)                |
| 1. Terminal                       |
| 2. Alameda y Urquiza              |
| 3. ...                            |
+-----------------------------------+
| Horarios: [Hábil][Sáb][Dom][Fer]  |
+-----------------------------------+
```

### Detalle de parada

```
+-----------------------------------+
| < Alameda y Urquiza           [*] |
+-----------------------------------+
| A 120 m · hacia el centro   [ ↑ ] |  <- flecha (magnetómetro)
| [ Cómo llegar ]                   |
+-----------------------------------+
| Línea 5 hacia Puerto Viejo        |
| 10:42 (en 8 min según tabla)      |
| 11:02  11:22     [ Avisarme ]     |
+-----------------------------------+
| Línea 14 hacia Bajada Grande      |
| No hay más servicio hasta mañana  |
| a las 5:20                        |
+-----------------------------------+
| 2 pasajeros reportaron demora     |
| en la L5 hace 15 min [Confirmar]  |
| [ Reportar una demora ]           |
+-----------------------------------+
```

### Reportar demora

```
+-----------------------------------+
| < Reportar demora                 |
+-----------------------------------+
| Línea:  [ L5 v ]                  |
| Motivo:                           |
| ( ) No pasó      ( ) Pasó lleno   |
| ( ) Viene demorado                |
| ( ) Unidad rota  ( ) Calle cortada|
+-----------------------------------+
| Comentario (opcional)             |
| [ ............................. ] |
| [ Sacar foto ]  [ Galería ]       |
+-----------------------------------+
| [        E N V I A R        ]     |
| Sin señal: se guarda y se envía   |
| solo cuando vuelva la conexión    |
+-----------------------------------+
```

### Avisos y detalle

```
+--------------------------+   +--------------------------+
| Avisos                   |   | < Desvío en Corrientes   |
+--------------------------+   +--------------------------+
| ! DESVÍO  L2 L7 L9       |   | Líneas: 2, 7, 9          |
| Corrientes · hasta 05/10 |   | Desde 14/09 hasta 05/10  |
|--------------------------|   | Desvían por Santa Fe...  |
| i  INFO  L3              |   | [ MAPA recorrido nuevo ] |
| Cambio de horario...     |   | [ ▶ VIDEO 0:20 ]         |
+--------------------------+   +--------------------------+
```

### Yo

```
+-----------------------------------+
| Yo                                |
| Julián Ferrari                    |
+-----------------------------------+
| > Favoritos                       |
| > Recordatorios activos           |
| Avisos de líneas favoritas  [ON]  |
| Tema: ( ) Claro ( ) Oscuro (•) Sistema|
| Datos guardados: hace 2 h [Actualizar]|
| [ Cerrar sesión ]                 |
+-----------------------------------+
```

---

## 4. Requisitos del TPI → dónde se cumplen en esta app

| #   | Requisito de la cátedra                                     | Cómo lo resolvemos                                                                                          |
| --- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1   | Pantallas + Expo Router                                     | Mapa de pantallas de la sección 2                                                                           |
| 2   | Auth + secure-store + local-authentication                  | Registro/login, token en `expo-secure-store`, desbloqueo con huella/rostro y alternativa (PIN o contraseña) |
| 3   | API detrás de capa de servicios + estados carga/vacío/error | `src/servicios/*` y un componente reutilizable de estados                                                   |
| 4   | Cámara + File System (API nueva)                            | QR de parada y foto del reporte; fotos y videos guardados con `File`, `Directory`, `Paths`                  |
| 5   | Location + react-native-maps, sin romper si se niega        | Paradas cercanas y recorridos; sin permiso se busca por nombre                                              |
| 6   | Notificaciones locales por hechos reales                    | Aviso nuevo en línea favorita; recordatorio de horario; reporte enviado tras sincronizar                    |
| 7   | sqlite + kv-store + expo-network                            | Horarios y recorridos en sqlite; preferencias en kv-store; banner de estado de red                          |
| 8   | Sensores o háptica                                          | Flecha hacia la parada con magnetómetro; vibración al confirmar un reporte                                  |
| 9   | Multimedia con controles visibles                           | `expo-video` para el video del desvío                                                                       |
| 10  | Ícono 1024×1024 PNG sin transparencia, splash, nombre       | Hacer temprano (se pide en el build)                                                                        |

---

## 5. Datos y almacenamiento

### Entidades (del PRD, van en `src/tipos/`)

`Coordenadas`, `Sentido`, `Recorrido`, `Linea`, `Parada`, `Horario`, `TipoDeDia`, `Aviso`, `Gravedad`, `ReporteDeDemora`, `MotivoDemora`, `Usuario`, `Tema`.

### Dónde guarda cada cosa

| Qué                                                  | Dónde                                       | Por qué                                           |
| ---------------------------------------------------- | ------------------------------------------- | ------------------------------------------------- |
| Token de sesión                                      | `expo-secure-store`                         | **Nunca** en kv-store                             |
| Líneas, recorridos, paradas, horarios                | `expo-sqlite`                               | Son muchos datos y deben funcionar offline        |
| Avisos (última copia)                                | `expo-sqlite`                               | Para mostrar algo sin red, marcados como "viejos" |
| Cola de reportes sin enviar                          | `expo-sqlite` (`sincronizado = false`)      | No se puede perder un reporte                     |
| Fotos del reporte pendiente, videos de desvíos       | `expo-file-system`                          | Archivos, no filas                                |
| Tema, avisos activos, fecha de última sincronización | `expo-sqlite/kv-store`                      | Preferencias simples                              |
| Favoritos                                            | sqlite local + sincronizados con el usuario | Que funcionen offline                             |

### Reglas del PRD que no se negocian

- IDs siempre `string`.
- Fechas ISO 8601 con zona (`"2026-09-14T10:22:00-03:00"`); los horarios de tabla son `"HH:MM"`.
- Claves en `camelCase`; lo que no tiene valor viene como `null`.
- Respuesta de la API: `{ datos, meta }` o `{ error: { codigo, mensaje } }`.
- Servicios **async desde el día 1**; ninguna pantalla importa el mock.

### Estructura de carpetas sugerida

```
src/
├── tipos/          # interfaces del PRD (se escriben una vez)
├── mocks/          # datos falsos tipados + casos feos
├── servicios/      # lineas.ts, paradas.ts, horarios.ts, avisos.ts, reportes.ts, auth.ts
├── db/             # esquema sqlite, migraciones, repositorios, cola de sincronización
├── hooks/          # useUbicacion, useRed, useProximosHorarios, useBrujula...
├── componentes/    # TarjetaLinea, ChipHorario, BannerOffline, EstadoVacio, Cargando, ErrorReintentar...
├── utils/          # horarios.ts, distancia.ts, rumbo.ts, fechas.ts (funciones puras)
└── tema/           # colores claro/oscuro, tamaños, espaciados
```

---

## 6. Lógica delicada (conviene escribirla como funciones puras y probarla)

- [ ] **`proximosHorarios(paradaId, ahora)`**: devuelve los próximos 3 por línea y sentido, con minutos que faltan.
- [ ] **"No hay más servicio hasta mañana a las X"**: calcular el primer horario del día siguiente (que puede ser de otro `tipoDeDia`, por ejemplo viernes → sábado).
- [ ] **Tipo de día**: hábil / sábado / domingo / feriado (ver duda sobre feriados).
- [ ] **Ida y vuelta separadas**: nunca mezclar paradas ni horarios de distinto sentido.
- [ ] **Distancia a la parada** (haversine) y **rumbo** para la flecha (bearing + brújula del magnetómetro).
- [ ] **Aviso vigente**: `desde <= ahora` y (`hasta === null` o `ahora <= hasta`).
- [ ] **Dato viejo**: comparar la fecha de la última sincronización con ahora y mostrar el banner.
- [ ] **QR ajeno o roto**: validar el formato `PARANA:par-xxx` y mostrar mensaje amable, sin crashear.

---

## 7. Objetivos (checklist)

### Fase 0 — Arranque

- [ ] Crear repo Git, acordar ramas y convención de commits
- [ ] Crear proyecto Expo + TypeScript + Expo Router
- [ ] Instalar todas las dependencias (y verificar que usamos `expo-audio`/`expo-video`, `File/Directory/Paths`, `@react-native-vector-icons/ionicons`)
- [ ] Crear cuenta de Expo y configurar EAS (`eas.json` con perfil `preview`, `app.json`)
- [ ] Definir nombre del producto, ícono 1024×1024 y splash (versión provisoria)
- [ ] Escribir tipos en `src/tipos/`
- [ ] Mandar las dudas de la sección 9 a la cátedra/cliente
- [ ] Probar la app en un teléfono real con Expo Go

### Fase 1 — Datos y esqueleto

- [ ] Mocks tipados: 14 líneas (al menos 3–4 completas), paradas, horarios, avisos, reportes
- [ ] Mocks de casos feos: parada sin horarios (fin de servicio), línea con desvío, aviso sin video, lista vacía, error de red
- [ ] Capa de servicios async con la forma `{ datos, meta }` / `{ error }`
- [ ] Navegación con tabs + pantallas vacías
- [ ] Componentes base: cargando, vacío, error con reintento
- [ ] Tema claro/oscuro, letra grande, botones grandes
- [ ] Esquema sqlite + guardar catálogo local
- [ ] `expo-network` + banner de estado de red
- [ ] **Primer build `preview` de prueba** (aunque tenga 2 pantallas) para detectar problemas de permisos/assets
- [ ] Mostrarle algo tocable a la cátedra/cliente

### Fase 2 — Núcleo de lectura

- [ ] Listado de líneas
- [ ] Detalle de línea: selector ida/vuelta, paradas en orden, trazado en mapa
- [ ] Horarios por tipo de día
- [ ] Mapa de paradas con ubicación del usuario
- [ ] Lista de paradas cercanas por distancia
- [ ] Búsqueda de parada por nombre o calle
- [ ] Detalle de parada con próximos 3 horarios y minutos
- [ ] Caso "no hay más servicio hasta mañana…"
- [ ] Botón "Cómo llegar" (abre app de mapas)
- [ ] App usable si se niega la ubicación
- [ ] Listado y detalle de avisos
- [ ] Aviso visible dentro de la línea afectada
- [ ] Recorrido alternativo dibujado en el mapa

### Fase 3 — Cuenta, escritura y dispositivo

- [ ] Registro e ingreso
- [ ] Token en secure-store; sesión que sobrevive al cierre
- [ ] Reingreso con huella/rostro + alternativa
- [ ] Favoritos de líneas y paradas
- [ ] Inicio mostrando favoritos primero
- [ ] Crear reporte de demora (motivo, comentario, foto)
- [ ] Cola offline de reportes + sincronización automática al volver la red
- [ ] Ver y confirmar reportes de otros en la parada
- [ ] Lector de QR de parada (y QR inválido sin romper)
- [ ] Notificación: aviso nuevo en línea favorita
- [ ] Notificación: recordatorio "avisame 10 min antes de las 7:15"
- [ ] Máximo una notificación por hecho (nada de spam)
- [ ] Flecha hacia la parada con magnetómetro
- [ ] Vibración al confirmar un reporte
- [ ] Video del desvío con `expo-video` y controles visibles
- [ ] Descargar videos y mapas para verlos offline (File System)

### Fase 4 — API real y cierre

- [ ] Cambiar los servicios del mock a `fetch` contra la API de la cátedra (solo cambian los servicios)
- [ ] Revisar estados de carga/vacío/error con datos reales
- [ ] Ícono y splash definitivos
- [ ] Probar sin conexión (modo avion) en teléfono real
- [ ] Probar permisos denegados (cámara, ubicación, notificaciones)
- [ ] Probar letra agrandada y modo oscuro
- [ ] **Build final `preview` (APK) instalado y probado sin Metro**
- [ ] Entregar link del build + repo en el Campus

### Fase 5 — Colchón y defensa

- [ ] Corregir bugs que aparezcan en el APK
- [ ] Cada integrante repasa y puede explicar su código línea por línea
- [ ] Ensayar la demo (15–20 min) en un teléfono
- [ ] Defensa oral

---

## 8. Checklist de los 10 requisitos mínimos (verificar antes de entregar)

- [ ] 1. Pantallas y navegación con Expo Router
- [ ] 2. Registro/ingreso, sesión persistente, token en secure-store, local-authentication con alternativa
- [ ] 3. API detrás de servicios; estados de carga, vacío y error visibles
- [ ] 4. expo-camera (foto + QR) y/o image-picker; File System con `File/Directory/Paths`
- [ ] 5. expo-location + react-native-maps; usable sin permiso
- [ ] 6. Notificaciones locales disparadas por hechos reales
- [ ] 7. expo-sqlite + kv-store; abre y muestra algo sin conexión; expo-network
- [ ] 8. Sensores o háptica con uso justificado
- [ ] 9. expo-video con controles a la vista
- [ ] 10. Ícono 1024×1024 sin transparencia, splash y nombre propios

---

## 9. Dudas y contradicciones del PRD para consultar

> El cliente pide explícitamente **preguntar en vez de decidir solos**. Dejamos una propuesta para cada una.

1. **Avisos "el mismo día" vs notificaciones locales.** El TPI pide notificaciones _locales_ (sin servidor push). La app solo puede enterarse de un aviso nuevo cuando se abre o sincroniza. _Propuesta:_ sincronizar avisos al abrir la app y cada tanto con tarea en segundo plano si se puede, y avisarle al cliente de esta limitación.
2. **Feriados.** Los horarios tienen tipo `feriado`, pero no hay dato que diga qué días son feriados. _Propuesta:_ que la API los entregue, o guardar una lista fija.
3. **Servicio pasada la medianoche.** ¿El "día de servicio" termina a las 24 o los horarios de madrugada (00:30) pertenecen al día anterior?
4. **Pantalla de inicio.** El texto dice "favoritos primero", pero el dibujo muestra paradas cercanas. _Propuesta:_ favoritos primero y, si no hay, las cercanas.
5. **Cuenta.** ¿Se puede mirar sin cuenta? _Propuesta:_ sí, la cuenta es para reportar y para guardar favoritos entre dispositivos. (El TPI igual exige registro e ingreso.)
6. **Reportes de demora:** ¿cuánto tiempo siguen vigentes? ¿Se puede confirmar una sola vez por persona? ¿Hay límite de reportes por persona para evitar spam?
7. **Quién ve los reportes agrupados por línea y parada.** El PRD dice "nosotros veamos", pero no hay panel ni rol de operador. _Propuesta:_ queda fuera de la app; los reportes se ven en la API.
8. **Parada y sentido.** `Parada` tiene un solo `sentido`. ¿Confirmar que la parada del otro lado de la calle es otra parada con otro id?
9. **Volumen de horarios.** ~600 paradas × líneas × 4 tipos de día es mucho para descargar con `porPagina: 20`. ¿Hay un endpoint de descarga completa o sincronización por línea?
10. **Recordatorio de horario:** ¿es de una sola vez o se repite todos los días hábiles?
11. **Videos de desvío:** ¿tamaño máximo? Importa para descargarlos y verlos sin datos.
12. **Modo oscuro:** el PRD lo pide, confirmar que respeta el tema del sistema por defecto.

---

## 10. Consideraciones de diseño y UX (del PRD)

- Se usa **parado en la calle, apurado y con una mano**: lo importante tiene que estar en la primera pantalla.
- **Letra grande, contraste alto, botones grandes**; respetar el tamaño de fuente del sistema sin que se rompa el diseño.
- **De noche y con poca luz**: buen modo oscuro.
- **Nunca inventar minutos.** Siempre "según la tabla".
- **Nadie lee instrucciones**: si hay que explicar cómo se usa, está mal.
- **Sin permisos no se rompe nada**: ubicación, cámara y notificaciones pueden negarse.
- **Android mayoría clara**, pero probar también iPhone si se puede.
- No convertir la app en una máquina de notificaciones.

## 11. Fuera de alcance (no lo hacemos)

- Posición en vivo de colectivos
- Carga y saldo de tarjeta
- Planificador de viajes ("cómo llego de A a B")
- Interurbanos
- Panel web para empresas

---

## 12. Riesgos y cómo evitarlos

| Riesgo                                                        | Prevención                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| El primer build EAS falla (permisos, assets, identificadores) | Hacer un build de prueba en la Fase 1 y otro final 7 días antes                                  |
| Cupo mensual de builds de EAS limitado                        | No gastar builds sin necesidad; probar con Expo Go                                               |
| API de la cátedra llega tarde                                 | Mocks fieles + capa de servicios: el cambio es solo en `src/servicios/`                          |
| Documentación vieja de internet                               | Usar `expo-audio`/`expo-video`, `File/Directory/Paths` y `@react-native-vector-icons/ionicons`   |
| Alguien del grupo no puede explicar su parte en la defensa    | Revisar el código de todos entre todos; usar IA para desarrollar es válido pero en la defensa no |
| Lógica de horarios con bugs sutiles                           | Funciones puras en `utils/` con casos de prueba (fin de servicio, cambio de día, feriado)        |
