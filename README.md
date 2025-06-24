# PW Retails

**PW Retails** es una plataforma para empresas de retail que permite gestionar incidentes de actividades criminales dentro de sus tiendas. La plataforma proporciona:

- Dashboard con métricas clave y visualización de datos
- Generación de reportes de incidentes
- Gestión y monitoreo de perfiles de sospechosos
- Análisis histórico y comparativo de incidentes

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15.1.0
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes UI**: Shadcn UI + Radix UI
- **Estado**: React Context + TanStack Query
- **Mapas**: Mapbox GL
- **Almacenamiento**: Cloudinary (imágenes)
- **Formularios**: React Hook Form + Zod
- **Gráficos**: Recharts
- **Gestión de paquetes**: pnpm

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js**: v18.0.0 o superior
- **pnpm**: v8.0.0 o superior (recomendado) o npm/yarn
- **Git**: Para clonar el repositorio

## 🚀 Setup de Desarrollo

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/pw-retails.git
cd pw-retails
```

### 2. Instalar dependencias

```bash
# Usando pnpm (recomendado)
pnpm install

# O usando npm
npm install

# O usando yarn
yarn install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto basándote en el archivo `.env.example`:

```bash
cp .env.example .env.local
```

Edita el archivo `.env.local` y configura las siguientes variables:

```bash
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Cloudinary (para carga de imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Mapbox (para mapas)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=tu_mapbox_token
```

### 4. Ejecutar la aplicación en modo desarrollo

```bash
# Usando pnpm
pnpm dev

# O usando npm
npm run dev

# O usando yarn
yarn dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📝 Scripts Disponibles

```bash
# Desarrollo con Turbopack (más rápido)
pnpm dev

# Construir para producción
pnpm build

# Ejecutar versión de producción
pnpm start

# Linting
pnpm lint

# Storybook (componentes)
pnpm storybook

# Construir Storybook
pnpm build-storybook
```

## 🧪 Testing y Calidad de Código

### Linting
```bash
# Ejecutar ESLint
pnpm lint

# Corregir errores automáticamente
pnpm lint --fix
```

### Formateo de código
El proyecto utiliza ESLint con configuración de Next.js para mantener la consistencia del código.

## 🏗️ Estructura del Proyecto

```
pw-retails/
├── app/                    # App Router de Next.js
│   ├── dashboard/         # Páginas del dashboard
│   ├── api/              # API routes
│   └── ...
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base (Shadcn UI)
│   ├── dashboard/        # Componentes específicos del dashboard
│   └── ...
├── context/              # Contextos de React
├── hooks/                # Custom hooks
├── lib/                  # Utilidades y configuraciones
├── services/             # Servicios de API
├── types/                # Definiciones de TypeScript
├── validators/           # Esquemas de validación (Zod)
└── ...
```

## 🔧 Configuración de Servicios Externos

### Cloudinary
1. Crea una cuenta en [Cloudinary](https://cloudinary.com/)
2. Obtén tu `cloud_name`, `api_key` y `api_secret`
3. Configúralos en tu archivo `.env.local`

### Mapbox
1. Crea una cuenta en [Mapbox](https://www.mapbox.com/)
2. Genera un token de acceso
3. Configúralo como `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

### API Backend
El proyecto está configurado para conectarse a una API backend. Asegúrate de:
1. Tener el servidor backend ejecutándose
2. Configurar la URL correcta en `NEXT_PUBLIC_API_URL`

## 🐛 Solución de Problemas Comunes

### Error de certificados SSL
Si encuentras problemas con certificados SSL en desarrollo, el proyecto ya incluye configuración para manejarlos en `next.config.ts`.

### Problemas con pnpm
Si tienes problemas con pnpm, puedes usar npm o yarn como alternativa:
```bash
rm -rf node_modules pnpm-lock.yaml
npm install
```

### Variables de entorno no cargadas
- Asegúrate de que el archivo `.env.local` esté en la raíz del proyecto
- Reinicia el servidor de desarrollo después de cambiar variables de entorno
- Las variables públicas deben comenzar con `NEXT_PUBLIC_`

## 📚 Documentación Adicional

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)
- [TanStack Query](https://tanstack.com/query)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Convenciones de Commits
- `feat:` nuevas funcionalidades
- `fix:` corrección de bugs
- `docs:` cambios en documentación
- `style:` cambios de formato
- `refactor:` refactorización de código
- `test:` agregar o modificar tests
- `chore:` tareas de mantenimiento

## 📄 Licencia

Este proyecto es privado y confidencial.

---

**Desarrollado por el equipo de PowerVision**
