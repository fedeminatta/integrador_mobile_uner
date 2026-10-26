# Base de datos — diagrama

> Base sqlite local de Paran.
> 15 tablas · 17 relaciones. Tipos de columna de sqlite; el comentario es el tipo de TypeScript.

```mermaid
erDiagram
  Usuario {
    TEXT id PK
    TEXT nombre
    TEXT email
    INTEGER avisosActivos
    TEXT tema "Tema"
    TEXT creadoEn "string (ISO)"
  }
  LineaFavorita {
    TEXT usuarioId FK
    TEXT lineaId FK
  }
  ParadaFavorita {
    TEXT usuarioId FK
    TEXT paradaId FK
  }
  ReporteDeDemora {
    TEXT id PK
    TEXT lineaId FK
    TEXT paradaId FK
    TEXT usuarioId FK
    TEXT motivo FK "MotivoDemora"
    TEXT comentario "string | null"
    TEXT fotoUri "string | null"
    INTEGER confirmaciones
    TEXT fechaHora "string (ISO)"
    INTEGER sincronizado
  }
  Parada {
    TEXT id PK
    TEXT nombre
    REAL latitud
    REAL longitud
    TEXT sentido "Sentido"
    INTEGER refugio
    TEXT codigoQr "string | null"
  }
  RecorridoParada {
    TEXT recorridoId FK
    TEXT paradaId FK
    INTEGER orden
  }
  Horario {
    TEXT id PK
    TEXT lineaId FK
    TEXT paradaId FK
    TEXT sentido "Sentido"
    TEXT tipoDeDia "TipoDeDia"
    TEXT hora "string HH:MM"
  }
  Linea {
    TEXT id PK
    TEXT numero
    TEXT nombre
    TEXT color
    INTEGER activa
    TEXT empresaId FK
  }
  Recorrido {
    TEXT id PK
    TEXT lineaId FK
    TEXT sentido "Sentido"
    TEXT destino
    TEXT trazado "Coordenadas[]"
  }
  Empresa {
    TEXT id PK
    TEXT nombre
  }
  Aviso {
    TEXT id PK
    TEXT titulo
    TEXT detalle
    TEXT desde "string (ISO)"
    TEXT hasta "string (ISO) | null"
    TEXT gravedad "Gravedad"
    TEXT trazadoAlternativo "Coordenadas[] | null"
    TEXT videoUrl "string | null"
  }
  AvisoLinea {
    TEXT avisoId FK
    TEXT lineaId FK
  }
  Frecuencia {
    TEXT id PK
    TEXT lineaId FK
    TEXT sentido "Sentido"
    TEXT tipoDeDia "TipoDeDia"
    TEXT desde "string HH:MM"
    TEXT hasta "string HH:MM"
    INTEGER cadaMinutos
  }
  Calle {
    TEXT id PK
    TEXT nombre
  }
  MotivoDemora {
    TEXT id PK "MotivoDemora"
    TEXT etiqueta
  }

  Usuario ||--o{ LineaFavorita : "usuarioId"
  Linea ||--o{ LineaFavorita : "lineaId"
  Usuario ||--o{ ParadaFavorita : "usuarioId"
  Parada ||--o{ ParadaFavorita : "paradaId"
  Linea ||--o{ ReporteDeDemora : "lineaId"
  Parada ||--o{ ReporteDeDemora : "paradaId"
  Usuario ||--o{ ReporteDeDemora : "usuarioId"
  MotivoDemora ||--o{ ReporteDeDemora : "motivo"
  Recorrido ||--o{ RecorridoParada : "recorridoId"
  Parada ||--o{ RecorridoParada : "paradaId"
  Linea ||--o{ Horario : "lineaId"
  Parada ||--o{ Horario : "paradaId"
  Empresa ||--o{ Linea : "empresaId"
  Linea ||--o{ Recorrido : "lineaId"
  Aviso ||--o{ AvisoLinea : "avisoId"
  Linea ||--o{ AvisoLinea : "lineaId"
  Linea ||--o{ Frecuencia : "lineaId"
```

## Cómo leerlo

- `||--o{`: uno a muchos (la tabla de la izquierda es la "1", la de la derecha la "N"). El texto es la columna FK.
- `PK` clave primaria · `FK` clave foránea. Las tablas sin PK simple usan PK compuesta:
  - `LineaFavorita`: (usuarioId, lineaId)
  - `ParadaFavorita`: (usuarioId, paradaId)
  - `RecorridoParada`: (recorridoId, orden)
  - `AvisoLinea`: (avisoId, lineaId)
- `TEXT` con `Sentido`, `TipoDeDia`, `Gravedad` o `Tema` lleva un `CHECK` con los valores permitidos. `ReporteDeDemora.motivo` es FK a la tabla `MotivoDemora`.

## Propiedades del PRD que no son columnas

Están en las interfaces de `src/tipos/`, pero en sqlite se arman con otra tabla:

- `Usuario.lineasFavoritas` (string[]) → tabla LineaFavorita
- `Usuario.paradasFavoritas` (string[]) → tabla ParadaFavorita
- `Parada.lineaIds` (string[]) → se calcula con RecorridoParada
- `Linea.empresa` (string) → JOIN con Empresa.nombre por empresaId
- `Linea.recorridos` (Recorrido[]) → tabla Recorrido
- `Recorrido.paradaIds` (string[]) → tabla RecorridoParada
- `Aviso.lineaIds` (string[]) → tabla AvisoLinea
