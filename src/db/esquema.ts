export const SQL_TABLAS_V1 = `
CREATE TABLE lineas (
  id      TEXT PRIMARY KEY NOT NULL,
  numero  TEXT NOT NULL,
  nombre  TEXT NOT NULL,
  color   TEXT NOT NULL,
  empresa TEXT NOT NULL,
  activa  INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE paradas (
  id       TEXT PRIMARY KEY NOT NULL,
  nombre   TEXT NOT NULL,
  latitud  REAL NOT NULL,
  longitud REAL NOT NULL,
  sentido  TEXT NOT NULL,
  refugio  INTEGER NOT NULL DEFAULT 0,
  codigoQr TEXT
);

CREATE TABLE recorridos (
  id      TEXT PRIMARY KEY NOT NULL,
  lineaId TEXT NOT NULL REFERENCES lineas(id) ON DELETE CASCADE,
  sentido TEXT NOT NULL,
  destino TEXT NOT NULL,
  trazado TEXT NOT NULL
);

CREATE TABLE recorrido_paradas (
  recorridoId TEXT NOT NULL REFERENCES recorridos(id) ON DELETE CASCADE,
  orden       INTEGER NOT NULL,
  paradaId    TEXT NOT NULL REFERENCES paradas(id) ON DELETE CASCADE,
  PRIMARY KEY (recorridoId, orden)
);

CREATE TABLE horarios (
  id        TEXT PRIMARY KEY NOT NULL,
  lineaId   TEXT NOT NULL REFERENCES lineas(id) ON DELETE CASCADE,
  paradaId  TEXT NOT NULL REFERENCES paradas(id) ON DELETE CASCADE,
  sentido   TEXT NOT NULL,
  tipoDeDia TEXT NOT NULL,
  hora      TEXT NOT NULL
);

CREATE TABLE avisos (
  id                 TEXT PRIMARY KEY NOT NULL,
  titulo             TEXT NOT NULL,
  detalle            TEXT NOT NULL,
  desde              TEXT NOT NULL,
  hasta              TEXT,
  gravedad           TEXT NOT NULL,
  trazadoAlternativo TEXT,
  videoUrl           TEXT
);

CREATE TABLE aviso_lineas (
  avisoId TEXT NOT NULL REFERENCES avisos(id) ON DELETE CASCADE,
  lineaId TEXT NOT NULL REFERENCES lineas(id) ON DELETE CASCADE,
  PRIMARY KEY (avisoId, lineaId)
);

CREATE TABLE usuario (
  id       TEXT PRIMARY KEY NOT NULL,
  nombre   TEXT NOT NULL,
  email    TEXT NOT NULL,
  creadoEn TEXT NOT NULL
);

CREATE TABLE lineas_favoritas (
  usuarioId TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  lineaId   TEXT NOT NULL REFERENCES lineas(id) ON DELETE CASCADE,
  PRIMARY KEY (usuarioId, lineaId)
);

CREATE TABLE paradas_favoritas (
  usuarioId TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  paradaId  TEXT NOT NULL REFERENCES paradas(id) ON DELETE CASCADE,
  PRIMARY KEY (usuarioId, paradaId)
);

CREATE TABLE motivos_demora (
  id       TEXT PRIMARY KEY NOT NULL,
  etiqueta TEXT NOT NULL
);

CREATE TABLE reportes (
  id           TEXT PRIMARY KEY NOT NULL,
  lineaId      TEXT NOT NULL REFERENCES lineas(id) ON DELETE CASCADE,
  paradaId     TEXT NOT NULL REFERENCES paradas(id) ON DELETE CASCADE,
  usuarioId    TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  motivoId     TEXT NOT NULL REFERENCES motivos_demora(id),
  comentario   TEXT,
  fotoUri      TEXT,
  fechaHora    TEXT NOT NULL,
  sincronizado INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE recordatorios (
  id             TEXT PRIMARY KEY NOT NULL,
  lineaId        TEXT NOT NULL REFERENCES lineas(id) ON DELETE CASCADE,
  paradaId       TEXT NOT NULL REFERENCES paradas(id) ON DELETE CASCADE,
  hora           TEXT NOT NULL,
  minutosAntes   INTEGER NOT NULL,
  repetir        INTEGER NOT NULL DEFAULT 0,
  notificacionId TEXT NOT NULL
);

-- Sin FK a propósito: si el aviso desaparece, el registro puede quedar.
CREATE TABLE avisos_notificados (
  avisoId      TEXT PRIMARY KEY NOT NULL,
  notificadoEn TEXT NOT NULL
);
`;

export const SQL_INDICES_V1 = `
CREATE INDEX idx_recorridos_linea     ON recorridos (lineaId);
CREATE INDEX idx_rp_parada            ON recorrido_paradas (paradaId);
CREATE INDEX idx_horarios_parada      ON horarios (paradaId, tipoDeDia, hora);
CREATE INDEX idx_horarios_linea       ON horarios (lineaId, tipoDeDia, sentido, paradaId);
CREATE INDEX idx_aviso_lineas_linea   ON aviso_lineas (lineaId);
CREATE INDEX idx_reportes_pendientes  ON reportes (sincronizado);
CREATE INDEX idx_recordatorios_parada ON recordatorios (paradaId);
`;

/** Los 5 motivos del enum MotivoDemora del PRD. */
export const SQL_DATOS_INICIALES_V1 = `
INSERT INTO motivos_demora (id, etiqueta) VALUES
  ('no_paso',      'No pasó'),
  ('paso_lleno',   'Pasó lleno y no paró'),
  ('demorado',     'Viene demorado'),
  ('unidad_rota',  'Unidad rota'),
  ('calle_cortada','Calle cortada');
`;
