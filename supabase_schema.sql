-- =============================================
-- ESQUEMA COMPLETO ACTUALIZADO - PERFIL VOCACIONAL
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Tabla principal de sesiones (Modificada para soporte Rural)
CREATE TABLE IF NOT EXISTS sesiones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  municipio TEXT NOT NULL,
  tipo_zona TEXT NOT NULL DEFAULT 'cabecera', -- 'cabecera' | 'corregimiento' | 'vereda'
  nombre_zona TEXT DEFAULT '',                -- Nombre de la vereda o corregimiento
  edad INTEGER NOT NULL,
  grupos_poblacionales TEXT[] DEFAULT '{}',
  programa TEXT NOT NULL,                    -- 'trabajo_social' | 'agroindustrial' | 'administracion'
  completado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de respuestas individuales
CREATE TABLE IF NOT EXISTS respuestas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sesion_id UUID REFERENCES sesiones(id) ON DELETE CASCADE,
  programa TEXT NOT NULL,
  dimension TEXT NOT NULL, -- 'ser' | 'hacer' | 'saber'
  pregunta_index INTEGER NOT NULL,
  valor INTEGER NOT NULL CHECK (valor BETWEEN 1 AND 4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de resultados calculados
CREATE TABLE IF NOT EXISTS resultados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sesion_id UUID REFERENCES sesiones(id) ON DELETE CASCADE UNIQUE,
  programa TEXT NOT NULL,
  puntaje_ser NUMERIC(5,2) NOT NULL,
  puntaje_hacer NUMERIC(5,2) NOT NULL,
  puntaje_saber NUMERIC(5,2) NOT NULL,
  afinidad_total NUMERIC(5,2) NOT NULL,
  dimension_dominante TEXT NOT NULL,
  insignia TEXT NOT NULL,
  fortalezas TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ÍNDICES OPTIMIZADOS (Nuevos campos incluidos)
-- =============================================
CREATE INDEX IF NOT EXISTS idx_sesiones_municipio ON sesiones(municipio);
CREATE INDEX IF NOT EXISTS idx_sesiones_tipo_zona ON sesiones(tipo_zona);
CREATE INDEX IF NOT EXISTS idx_sesiones_nombre_zona ON sesiones(nombre_zona);
CREATE INDEX IF NOT EXISTS idx_sesiones_programa ON sesiones(programa);
CREATE INDEX IF NOT EXISTS idx_sesiones_created ON sesiones(created_at);
CREATE INDEX IF NOT EXISTS idx_resultados_programa ON resultados(programa);
CREATE INDEX IF NOT EXISTS idx_resultados_afinidad ON resultados(afinidad_total);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_sesiones" ON sesiones FOR INSERT WITH CHECK (true);
CREATE POLICY "insert_respuestas" ON respuestas FOR INSERT WITH CHECK (true);
CREATE POLICY "insert_resultados" ON resultados FOR INSERT WITH CHECK (true);
CREATE POLICY "select_sesion_propia" ON sesiones FOR SELECT USING (true);
CREATE POLICY "select_resultado_propio" ON resultados FOR SELECT USING (true);
CREATE POLICY "update_sesion" ON sesiones FOR UPDATE USING (true);

-- =============================================
-- VISTAS PARA DASHBOARD REESCRITAS CON SOPORTE RURAL
-- =============================================

-- 1. Resumen General (Métricas globales + Porcentajes de ruralidad)
CREATE OR REPLACE VIEW vista_resumen_general AS
SELECT
  COUNT(DISTINCT s.id) AS total_participantes,
  COUNT(DISTINCT s.municipio) AS total_municipios,
  -- Cálculo de impacto rural en porcentaje
  ROUND((COUNT(DISTINCT CASE WHEN s.tipo_zona != 'cabecera' THEN s.id END) * 100.0 / COUNT(DISTINCT s.id))::numeric, 1) AS porcentaje_participacion_rural,
  MODE() WITHIN GROUP (ORDER BY s.programa) AS programa_mas_popular,
  ROUND(AVG(r.puntaje_ser)::numeric, 1) AS promedio_ser,
  ROUND(AVG(r.puntaje_hacer)::numeric, 1) AS promedio_hacer,
  ROUND(AVG(r.puntaje_saber)::numeric, 1) AS promedio_saber,
  ROUND(AVG(r.afinidad_total)::numeric, 1) AS afinidad_promedio_global
FROM sesiones s
LEFT JOIN resultados r ON s.id = r.sesion_id
WHERE s.completado = TRUE;

-- 2. Análisis por Municipio y Desglose de Zonas Rurales
CREATE OR REPLACE VIEW vista_por_municipio AS
SELECT
  s.municipio,
  COUNT(DISTINCT s.id) AS total_participantes,
  COUNT(DISTINCT CASE WHEN s.tipo_zona = 'cabecera' THEN s.id END) AS participantes_urbanos,
  COUNT(DISTINCT CASE WHEN s.tipo_zona = 'corregimiento' THEN s.id END) AS participantes_corregimiento,
  COUNT(DISTINCT CASE WHEN s.tipo_zona = 'vereda' THEN s.id END) AS participantes_vereda,
  MODE() WITHIN GROUP (ORDER BY s.programa) AS programa_dominante,
  MODE() WITHIN GROUP (ORDER BY r.dimension_dominante) AS competencia_dominante,
  ROUND(AVG(r.afinidad_total)::numeric, 1) AS afinidad_promedio
FROM sesiones s
LEFT JOIN resultados r ON s.id = r.sesion_id
WHERE s.completado = TRUE
GROUP BY s.municipio
ORDER BY total_participantes DESC;

-- 3. Nueva vista específica para el análisis de Veredas y Corregimientos
CREATE OR REPLACE VIEW vista_analisis_rural AS
SELECT
  s.municipio,
  INITCAP(s.tipo_zona) AS zona_tipo,
  COALESCE(NULLIF(s.nombre_zona, ''), 'No Especificado') AS comunidad,
  COUNT(DISTINCT s.id) AS total_participantes,
  MODE() WITHIN GROUP (ORDER BY s.programa) AS programa_preferido,
  ROUND(AVG(r.afinidad_total)::numeric, 1) AS afinidad_promedio
FROM sesiones s
LEFT JOIN resultados r ON s.id = r.sesion_id
WHERE s.completado = TRUE AND s.tipo_zona != 'cabecera'
GROUP BY s.municipio, s.tipo_zona, s.nombre_zona
ORDER BY total_participantes DESC, s.municipio ASC;

-- 4. Distribución por Programa (Mantiene métricas previas)
CREATE OR REPLACE VIEW vista_por_programa AS
SELECT
  s.programa,
  COUNT(DISTINCT s.id) AS total_participantes,
  ROUND(AVG(r.puntaje_ser)::numeric, 1) AS promedio_ser,
  ROUND(AVG(r.puntaje_hacer)::numeric, 1) AS promedio_hacer,
  ROUND(AVG(r.puntaje_saber)::numeric, 1) AS promedio_saber,
  ROUND(AVG(r.afinidad_total)::numeric, 1) AS afinidad_promedio,
  MODE() WITHIN GROUP (ORDER BY r.dimension_dominante) AS dimension_dominante
FROM sesiones s
LEFT JOIN resultados r ON s.id = r.sesion_id
WHERE s.completado = TRUE
GROUP BY s.programa;

-- 5. Distribución por Edad (Mantiene métricas previas)
CREATE OR REPLACE VIEW vista_distribucion_edad AS
SELECT
  CASE
    WHEN edad BETWEEN 14 AND 17 THEN '14-17'
    WHEN edad BETWEEN 18 AND 25 THEN '18-25'
    WHEN edad BETWEEN 26 AND 35 THEN '26-35'
    WHEN edad BETWEEN 36 AND 45 THEN '36-45'
    ELSE '46+'
  END AS rango_edad,
  COUNT(*) AS total,
  MODE() WITHIN GROUP (ORDER BY programa) AS programa_preferido
FROM sesiones
WHERE completado = TRUE
GROUP BY 1
ORDER BY 1;

-- =============================================
-- FUNCIÓN EXTENDIDA: Estadísticas de municipio completas
-- =============================================
CREATE OR REPLACE FUNCTION stats_municipio(p_municipio TEXT)
RETURNS JSON AS $$
DECLARE
  resultado JSON;
BEGIN
  SELECT json_build_object(
    'municipio', p_municipio,
    'total_encuestados', COUNT(DISTINCT s.id),
    'distribucion_zona', json_build_object(
      'urbanos', COUNT(DISTINCT CASE WHEN s.tipo_zona = 'cabecera' THEN s.id END),
      'corregimientos', COUNT(DISTINCT CASE WHEN s.tipo_zona = 'corregimiento' THEN s.id END),
      'veredas', COUNT(DISTINCT CASE WHEN s.tipo_zona = 'vereda' THEN s.id END)
    ),
    'comunidades_rurales_registradas', COALESCE(json_agg(DISTINCT s.nombre_zona) FILTER (WHERE s.nombre_zona != ''), '[]'::json),
    'afinidad_promedio', ROUND(AVG(r.afinidad_total)::numeric, 1)
  ) INTO resultado
  FROM sesiones s
  LEFT JOIN resultados r ON s.id = r.sesion_id
  WHERE s.municipio = p_municipio AND s.completado = TRUE;
  
  RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TABLA DE CONFIGURACIÓN DEL DASHBOARD
-- =============================================
CREATE TABLE IF NOT EXISTS configuracion (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  descripcion TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO configuracion (clave, valor, descripcion)
VALUES ('dashboard_password', 'CatatumboUIS2024', 'Contraseña de acceso al dashboard administrativo')
ON CONFLICT (clave) DO NOTHING;

ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leer_dashboard_password" ON configuracion
  FOR SELECT USING (clave = 'dashboard_password');

SELECT 'Schema actualizado con soporte rural y vistas de segmentación' AS status;