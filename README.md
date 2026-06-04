# 🎯 Perfil Vocacional — Norte de Santander

Experiencia web interactiva de descubrimiento vocacional con Supabase como base de datos.

---

## 🚀 INICIO RÁPIDO (en local con Supabase)

### Paso 1 — Crear el proyecto en Supabase

1. Ve a https://supabase.com → **New Project**
2. Nombre: `perfil-vocacional`
3. Región: `South America (São Paulo)`
4. Guarda la contraseña del proyecto
5. Espera que inicie (~2 minutos)

### Paso 2 — Crear las tablas

1. En Supabase ve a **SQL Editor**
2. Copia y pega todo el contenido de `supabase_schema.sql`
3. Haz clic en **Run**
4. Verifica que diga: `Schema creado exitosamente`

### Paso 3 — Obtener las credenciales

1. En Supabase ve a **Settings → API**
2. Copia:
   - **Project URL** → `https://xxxxx.supabase.co`
   - **anon public** key

### Paso 4 — Configurar el proyecto local

```bash
# Clonar o descomprimir el proyecto
cd perfil-vocacional

# Crear archivo de variables de entorno
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales reales:
```
VITE_SUPABASE_URL=https://TU_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...tu_clave_aqui
```

### Paso 5 — Instalar dependencias y correr

```bash
npm install
npm run dev
```

Abre: http://localhost:5173

Dashboard admin: http://localhost:5173/dashboard
Contraseña dashboard: `admin2024`

---

## 📁 Estructura del proyecto

```
src/
├── components/
│   ├── steps/
│   │   ├── Welcome.jsx          # Pantalla de bienvenida
│   │   ├── InfoGeneral.jsx      # Municipio, edad, grupos
│   │   ├── SelectPrograma.jsx   # Elección de carrera
│   │   ├── VideoPrograma.jsx    # Video del programa
│   │   ├── Cuestionario.jsx     # 9 preguntas SER/HACER/SABER
│   │   └── Resultado.jsx        # Resultado con gráficas
│   └── Dashboard.jsx            # Panel administrativo (3 vistas)
├── data/
│   ├── municipios.js            # 44 municipios de Norte de Santander
│   ├── programas.js             # Configuración de los 3 programas
│   └── preguntas.js             # Preguntas por programa y dimensión
├── hooks/
│   └── useExperiencia.js        # Lógica principal + llamadas a Supabase
├── lib/
│   └── supabase.js              # Cliente de Supabase
└── utils/
    └── calculos.js              # Algoritmo de cálculo de afinidad
```

---

## 🔧 Personalización importante

### Cambiar los videos
En `src/data/programas.js`, línea `videoUrl`, reemplaza los URLs de YouTube:
```js
videoUrl: 'https://www.youtube.com/embed/TU_VIDEO_ID',
```

### Cambiar la contraseña del dashboard
En `src/components/Dashboard.jsx`:
```js
const DASHBOARD_PASSWORD = 'tu_nueva_contraseña'
```

### Agregar municipios
En `src/data/municipios.js`, agrega al array `MUNICIPIOS`.

---

## 🌐 Deploy a producción (Vercel)

```bash
npm install -g vercel
vercel
```

Al hacer deploy, agrega las variables de entorno en Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🗃️ Base de datos (Supabase)

### Tablas creadas
| Tabla | Descripción |
|-------|-------------|
| `sesiones` | Registro anónimo por participante |
| `respuestas` | Respuesta individual por pregunta |
| `resultados` | Resultado calculado por sesión |

### Vistas de análisis
| Vista | Uso |
|-------|-----|
| `vista_resumen_general` | Totales globales |
| `vista_por_municipio` | Datos por municipio |
| `vista_por_programa` | Comparativo de programas |
| `vista_distribucion_edad` | Rangos de edad |

### Exportar datos para Power BI
En Supabase → **Table Editor** → Selecciona tabla → **Export CSV**

O conecta Power BI directamente con el conector PostgreSQL:
- Host: `db.TU_ID.supabase.co`
- Port: `5432`
- Database: `postgres`
- User: `postgres`
- Password: la que usaste al crear el proyecto

---

## 🔒 Privacidad

La experiencia NO recoge:
- Nombre, documento, correo, teléfono, dirección

Solo almacena:
- Municipio, edad, grupo poblacional (opcional)
- Programa, respuestas, resultado calculado, fecha

---

## 📦 Dependencias principales

| Paquete | Uso |
|---------|-----|
| `@supabase/supabase-js` | Base de datos en la nube |
| `recharts` | Gráficas del dashboard y resultado |
| `tailwindcss` | Estilos |
| `jspdf` | (Preparado) Exportar resultado en PDF |
| `lucide-react` | Iconos |
