-- =============================================
-- ESQUEMA CATATUMBO - Ejecutar en Supabase SQL Editor
-- =============================================

-- Tabla principal de participantes
CREATE TABLE IF NOT EXISTS participantes (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Caracterización
  nombre            TEXT NOT NULL,
  municipio         TEXT NOT NULL,
  corregimiento     TEXT,
  vereda            TEXT,
  tipo_actor        TEXT NOT NULL, -- 'estudiante'|'docente'|'comunidad'|'organizacion'
  edad              INTEGER,
  -- Campos según tipo actor
  colegio           TEXT,
  grado             TEXT,
  institucion       TEXT,
  area              TEXT,
  nivel_educativo   TEXT,
  organizacion      TEXT,
  correo            TEXT,
  participo_antes   BOOLEAN,
  -- Control
  completado        BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Videos vistos (registro de cumplimiento)
CREATE TABLE IF NOT EXISTS videos_vistos (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participante_id UUID REFERENCES participantes(id) ON DELETE CASCADE,
  video_id       TEXT NOT NULL,  -- identificador del video
  seccion        TEXT NOT NULL,  -- 'capsula_por_que'|'capsula_programas'|'programa_ts'|etc
  visto          BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Programas priorizados (orden drag & drop)
CREATE TABLE IF NOT EXISTS programas_orden (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participante_id UUID REFERENCES participantes(id) ON DELETE CASCADE,
  programa        TEXT NOT NULL,
  orden           INTEGER NOT NULL,  -- 1=primera preferencia
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Perfil de ingreso (drag & drop por categoría)
CREATE TABLE IF NOT EXISTS perfil_ingreso (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participante_id UUID REFERENCES participantes(id) ON DELETE CASCADE,
  programa        TEXT NOT NULL,
  categoria       TEXT NOT NULL,  -- 'saber'|'ser'|'hacer'
  competencia     TEXT NOT NULL,
  orden_prioridad INTEGER NOT NULL,
  comentario_libre TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Perfil de egreso
CREATE TABLE IF NOT EXISTS perfil_egreso (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participante_id UUID REFERENCES participantes(id) ON DELETE CASCADE,
  programa        TEXT NOT NULL,
  competencia     TEXT NOT NULL,
  orden_prioridad INTEGER NOT NULL,
  comentario_libre TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Líneas de investigación seleccionadas
CREATE TABLE IF NOT EXISTS lineas_investigacion (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participante_id UUID REFERENCES participantes(id) ON DELETE CASCADE,
  programa        TEXT NOT NULL,
  linea           TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Electivas seleccionadas
CREATE TABLE IF NOT EXISTS electivas (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participante_id UUID REFERENCES participantes(id) ON DELETE CASCADE,
  programa        TEXT NOT NULL,
  electiva        TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Empleabilidad y manifiesto
CREATE TABLE IF NOT EXISTS manifiesto (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participante_id      UUID REFERENCES participantes(id) ON DELETE CASCADE,
  empleabilidad_ts     TEXT,  -- respuesta libre Trabajo Social
  empleabilidad_ia     TEXT,  -- Ingeniería Agronómica
  empleabilidad_adm    TEXT,  -- Administración
  comentario_final     TEXT,
  firma_svg            TEXT,  -- firma digital en SVG/base64
  acepta_manifiesto    BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Certificados generados
CREATE TABLE IF NOT EXISTS certificados (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participante_id UUID REFERENCES participantes(id) ON DELETE CASCADE,
  codigo_qr       TEXT UNIQUE NOT NULL,  -- código único de validación
  programas       TEXT[],
  fecha_emision   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ÍNDICES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_participantes_municipio  ON participantes(municipio);
CREATE INDEX IF NOT EXISTS idx_participantes_tipo_actor ON participantes(tipo_actor);
CREATE INDEX IF NOT EXISTS idx_participantes_created    ON participantes(created_at);
CREATE INDEX IF NOT EXISTS idx_certificados_codigo      ON certificados(codigo_qr);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE participantes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos_vistos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE programas_orden      ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_ingreso       ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfil_egreso        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineas_investigacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE electivas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE manifiesto           ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificados         ENABLE ROW LEVEL SECURITY;

-- Anónimos pueden insertar (participantes del territorio)
CREATE POLICY "anon_insert_participantes"        ON participantes        FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_participantes"        ON participantes        FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_videos"               ON videos_vistos        FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_insert_programas_orden"      ON programas_orden      FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_insert_perfil_ingreso"       ON perfil_ingreso       FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_insert_perfil_egreso"        ON perfil_egreso        FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_insert_lineas"               ON lineas_investigacion FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_insert_electivas"            ON electivas            FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_insert_manifiesto"           ON manifiesto           FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_insert_certificados"         ON certificados         FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_select_certificados"         ON certificados         FOR SELECT TO anon, authenticated USING (true);

-- Admins autenticados pueden leer todo
CREATE POLICY "auth_select_participantes"        ON participantes        FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select_videos"               ON videos_vistos        FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select_programas_orden"      ON programas_orden      FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select_perfil_ingreso"       ON perfil_ingreso       FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select_perfil_egreso"        ON perfil_egreso        FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select_lineas"               ON lineas_investigacion FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select_electivas"            ON electivas            FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select_manifiesto"           ON manifiesto           FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_select_certificados"         ON certificados         FOR SELECT TO authenticated USING (true);

-- Admins pueden eliminar
CREATE POLICY "auth_delete_participantes"        ON participantes        FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete_videos"               ON videos_vistos        FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete_programas_orden"      ON programas_orden      FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete_perfil_ingreso"       ON perfil_ingreso       FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete_perfil_egreso"        ON perfil_egreso        FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete_lineas"               ON lineas_investigacion FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete_electivas"            ON electivas            FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete_manifiesto"           ON manifiesto           FOR DELETE TO authenticated USING (true);
CREATE POLICY "auth_delete_certificados"         ON certificados         FOR DELETE TO authenticated USING (true);

-- ─── VISTA DASHBOARD ─────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vista_dashboard AS
SELECT
  COUNT(DISTINCT p.id)                                    AS total_participantes,
  COUNT(DISTINCT p.municipio)                             AS total_municipios,
  COUNT(DISTINCT CASE WHEN p.completado THEN p.id END)    AS completados,
  COUNT(DISTINCT CASE WHEN p.tipo_actor='estudiante'    THEN p.id END) AS estudiantes,
  COUNT(DISTINCT CASE WHEN p.tipo_actor='docente'       THEN p.id END) AS docentes,
  COUNT(DISTINCT CASE WHEN p.tipo_actor='comunidad'     THEN p.id END) AS comunidad,
  COUNT(DISTINCT CASE WHEN p.tipo_actor='organizacion'  THEN p.id END) AS organizaciones
FROM participantes p;

SELECT 'Schema Catatumbo creado exitosamente ✅' AS status;
