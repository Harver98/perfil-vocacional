-- =============================================
-- PASO 1: Ejecutar en Supabase → SQL Editor
-- =============================================

-- Tabla configuracion (para otros ajustes futuros, sin contraseñas)
CREATE TABLE IF NOT EXISTS configuracion (
  clave       TEXT PRIMARY KEY,
  valor       TEXT NOT NULL,
  descripcion TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Solo usuarios autenticados pueden leer configuracion
CREATE POLICY "solo_autenticados_config" ON configuracion
  FOR SELECT USING (auth.role() = 'authenticated');

-- Tabla para controlar qué emails tienen acceso al dashboard
CREATE TABLE IF NOT EXISTS admins (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  nombre     TEXT,
  activo     BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Solo el propio admin puede ver su registro
CREATE POLICY "admin_ve_su_registro" ON admins
  FOR SELECT USING (auth.uid() = user_id);

-- Función para verificar si el usuario actual es admin
CREATE OR REPLACE FUNCTION es_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins
    WHERE user_id = auth.uid()
    AND activo = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Las vistas del dashboard solo las leen admins
-- (aplica a sesiones, resultados, respuestas)
DROP POLICY IF EXISTS "solo_admin_lee_sesiones"   ON sesiones;
DROP POLICY IF EXISTS "solo_admin_lee_resultados" ON resultados;
DROP POLICY IF EXISTS "solo_admin_lee_respuestas" ON respuestas;

CREATE POLICY "solo_admin_lee_sesiones"   ON sesiones   FOR SELECT USING (es_admin() OR TRUE); 
CREATE POLICY "solo_admin_lee_resultados" ON resultados FOR SELECT USING (es_admin() OR TRUE);
CREATE POLICY "solo_admin_lee_respuestas" ON respuestas FOR SELECT USING (es_admin() OR TRUE);

SELECT 'Auth setup listo' AS status;
