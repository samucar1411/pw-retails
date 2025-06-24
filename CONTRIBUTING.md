# Guía de Contribución - PW Retails

¡Gracias por tu interés en contribuir al proyecto PW Retails! Esta guía te ayudará a entender nuestro flujo de trabajo y estándares de desarrollo.

## 📋 Tabla de Contenidos

- [Configuración Inicial](#configuración-inicial)
- [Flujo de Trabajo con Ramas](#flujo-de-trabajo-con-ramas)
- [Estándares de Commits](#estándares-de-commits)
- [Proceso de Pull Requests](#proceso-de-pull-requests)
- [Guía de Estilo](#guía-de-estilo)
- [Testing](#testing)
- [Documentación](#documentación)

## 🚀 Configuración Inicial

### Prerrequisitos
- Node.js v18.0.0 o superior
- pnpm v8.0.0 o superior
- Git configurado con tu información

### Fork y Clonación
```bash
# 1. Haz fork del repositorio en GitHub
# 2. Clona tu fork
git clone https://github.com/tu-usuario/pw-retails.git
cd pw-retails

# 3. Configura el repositorio upstream
git remote add upstream https://github.com/samucar1411/pw-retails.git

# 4. Instala dependencias
pnpm install

# 5. Configura variables de entorno
cp .env.example .env.local
# Edita .env.local con tus valores
```

## 🌿 Flujo de Trabajo con Ramas

### Convenciones de Naming

Utiliza el siguiente formato para nombrar tus ramas:

```
<tipo>/<descripción-corta>
```

#### Tipos de Ramas:

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feature/` | Nueva funcionalidad | `feature/dashboard-analytics` |
| `fix/` | Corrección de bugs | `fix/login-validation-error` |
| `chore/` | Tareas de mantenimiento | `chore/update-dependencies` |
| `refactor/` | Refactorización de código | `refactor/incident-service-cleanup` |
| `docs/` | Documentación | `docs/api-endpoints-guide` |
| `style/` | Cambios de estilo/formato | `style/tailwind-component-cleanup` |
| `test/` | Pruebas | `test/incident-form-validation` |
| `perf/` | Mejoras de rendimiento | `perf/optimize-dashboard-queries` |

### Flujo de Trabajo

```bash
# 1. Asegúrate de estar en main y actualizado
git checkout main
git pull upstream main

# 2. Crea una nueva rama
git checkout -b feature/nueva-funcionalidad

# 3. Desarrolla tu funcionalidad
# ... haz tus cambios ...

# 4. Realiza commits siguiendo las convenciones
git add .
git commit -m "feat: agregar nueva funcionalidad de analytics"

# 5. Push a tu fork
git push origin feature/nueva-funcionalidad

# 6. Abre un Pull Request en GitHub
```

## 📝 Estándares de Commits

Utilizamos **Conventional Commits** para mantener un historial claro y estructurado.

### Formato

```
<tipo>[scope opcional]: <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos de Commits

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `feat: agregar filtros al dashboard` |
| `fix` | Corrección de bugs | `fix: corregir validación de formulario` |
| `docs` | Documentación | `docs: actualizar README con setup` |
| `style` | Formateo, espacios | `style: aplicar prettier a componentes` |
| `refactor` | Refactorización | `refactor: simplificar lógica de auth` |
| `test` | Pruebas | `test: agregar tests para incident-form` |
| `chore` | Mantenimiento | `chore: actualizar dependencias` |
| `perf` | Rendimiento | `perf: optimizar consultas de dashboard` |
| `ci` | Integración continua | `ci: agregar workflow de deployment` |
| `build` | Sistema de build | `build: configurar webpack para prod` |
| `revert` | Revertir cambios | `revert: feat: revertir cambio problemático` |

### Ejemplos de Commits

```bash
# ✅ Buenos commits
feat: agregar componente de selector de oficinas
fix: corregir error de validación en formulario de incidentes
docs: actualizar guía de instalación
style: aplicar formato ESLint a archivos TypeScript
refactor: extraer lógica de API a servicios separados
test: agregar tests unitarios para utils de formateo

# ❌ Malos commits
Update stuff
Fixed bug
WIP
asdfgh
```

### Reglas de Commits

1. **Usar minúsculas** en el tipo y descripción
2. **No terminar con punto** la descripción
3. **Máximo 72 caracteres** en la primera línea
4. **Usar modo imperativo** ("agregar" no "agregado")
5. **Incluir scope** cuando sea relevante: `feat(dashboard): agregar gráfico de tendencias`

## 🔄 Proceso de Pull Requests

### Antes de Crear un PR

1. **Actualiza tu rama** con los últimos cambios:
```bash
git checkout main
git pull upstream main
git checkout tu-rama
git rebase main
```

2. **Ejecuta las verificaciones locales**:
```bash
# Linting
pnpm lint

# Build
pnpm build

# Tests (si los hay)
pnpm test
```

3. **Asegúrate de que tu código esté limpio**:
```bash
# Corrige errores de linting automáticamente
pnpm lint --fix
```

### Creando el Pull Request

#### Título del PR
Usa el mismo formato que los commits:
```
feat: agregar componente de analytics del dashboard
fix: corregir error de validación en formulario de sospechosos
```

#### Descripción del PR
Incluye la siguiente información:

```markdown
## 📋 Descripción
Breve descripción de los cambios realizados.

## 🔄 Tipo de Cambio
- [ ] Bug fix (cambio que corrige un problema)
- [ ] Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] Breaking change (cambio que puede romper funcionalidad existente)
- [ ] Documentación
- [ ] Refactorización
- [ ] Mejora de rendimiento

## 🧪 Tests
- [ ] He probado estos cambios localmente
- [ ] He agregado tests para los nuevos cambios
- [ ] Todos los tests existentes pasan

## 📸 Screenshots (si aplica)
[Incluir screenshots de cambios visuales]

## 📝 Notas Adicionales
Cualquier información adicional relevante para los revisores.
```

### Etiquetas de PR

Usa las siguientes etiquetas:

| Etiqueta | Descripción |
|----------|-------------|
| `enhancement` | Nueva funcionalidad |
| `bug` | Corrección de bug |
| `documentation` | Cambios en documentación |
| `dependencies` | Actualización de dependencias |
| `breaking-change` | Cambio que rompe compatibilidad |
| `needs-review` | Necesita revisión |
| `work-in-progress` | Trabajo en progreso |

### Reglas de Merge

Para que un PR sea aprobado y merged, debe cumplir:

1. ✅ **Pasar todas las verificaciones de CI**
2. ✅ **Mínimo 2 revisiones aprobatorias** (para cambios importantes)
3. ✅ **Mínimo 1 revisión aprobatoria** (para cambios menores)
4. ✅ **No tener conflictos de merge**
5. ✅ **Cumplir con estándares de código**
6. ✅ **Incluir documentación** si es necesaria

### Proceso de Revisión

1. **Asigna revisores** apropiados
2. **Responde a comentarios** de manera constructiva
3. **Realiza cambios solicitados** en commits adicionales
4. **Solicita nueva revisión** después de cambios significativos

## 🎨 Guía de Estilo

### Configuración de Herramientas

#### ESLint
El proyecto usa ESLint con configuración de Next.js:

```bash
# Ejecutar linting
pnpm lint

# Corregir errores automáticamente
pnpm lint --fix
```

#### Configuración de Editor
Recomendamos usar VS Code con las siguientes extensiones:

- ESLint
- Prettier
- TypeScript Importer
- Tailwind CSS IntelliSense
- Auto Rename Tag

### Convenciones de Código

#### TypeScript
```typescript
// ✅ Usar interfaces sobre types
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Usar const objects con 'as const' en lugar de enums
const INCIDENT_STATUS = {
  PENDING: 'pending',
  RESOLVED: 'resolved',
  IN_PROGRESS: 'in_progress'
} as const;

// ✅ Tipos explícitos para funciones
function processIncident(incident: Incident): ProcessedIncident {
  // ...
}

// ✅ Usar absolute imports
import { Button } from '@/components/ui/button';
import { useIncident } from '@/hooks/use-incident';
```

#### React Components
```typescript
// ✅ Functional components con TypeScript
interface DashboardProps {
  title: string;
  data: IncidentData[];
}

export function Dashboard({ title, data }: DashboardProps): JSX.Element {
  // ✅ Usar descriptive variable names
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // ✅ Cleanup en useEffect
  useEffect(() => {
    const cleanup = () => {
      // cleanup logic
    };
    
    return cleanup;
  }, []);

  return (
    <div className="dashboard">
      {/* JSX */}
    </div>
  );
}
```

### Convenciones de Naming

#### Archivos y Directorios
```
// ✅ Componentes - PascalCase
DashboardHeader.tsx
IncidentForm.tsx

// ✅ Utilities - camelCase
formValidator.ts
dateUtils.ts

// ✅ Directorios - kebab-case
incident-form/
dashboard-analytics/

// ✅ Hooks - camelCase con 'use' prefix
useIncident.ts
useAuthContext.ts
```

#### Variables y Funciones
```typescript
// ✅ Variables - camelCase con auxiliary verbs
const isLoading = true;
const hasError = false;
const canSubmit = false;

// ✅ Funciones - camelCase, imperativo
function handleSubmit() {}
function validateForm() {}
function fetchIncidents() {}

// ✅ Constantes - UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
```

### Estructura de Carpetas

```
components/
├── ui/                    # Componentes base (Shadcn UI)
├── dashboard/            # Componentes específicos del dashboard
├── incident-form/        # Componentes del formulario de incidentes
└── layout/              # Componentes de layout

hooks/
├── use-incident.ts       # Hook para manejo de incidentes
├── use-auth.ts          # Hook para autenticación
└── use-api-error.ts     # Hook para manejo de errores

services/
├── incident-service.ts   # Servicio de API para incidentes
├── auth-service.ts      # Servicio de autenticación
└── api.ts               # Cliente base de API

types/
├── incident.ts          # Tipos relacionados con incidentes
├── user.ts             # Tipos de usuario
└── common.ts           # Tipos compartidos
```

### Tailwind CSS

```typescript
// ✅ Usar clases utilitarias de Tailwind
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">

// ✅ Usar cn() helper para conditional classes
import { cn } from '@/lib/utils';

<Button 
  className={cn(
    "bg-blue-500 hover:bg-blue-600",
    isDisabled && "opacity-50 cursor-not-allowed"
  )}
>
```

## 🧪 Testing

### Ejecutar Tests
```bash
# Ejecutar todos los tests
pnpm test

# Ejecutar tests en modo watch
pnpm test:watch

# Ejecutar tests con coverage
pnpm test:coverage
```

### Escribir Tests
```typescript
// ✅ Nombrar tests descriptivamente
describe('IncidentForm', () => {
  it('should validate required fields on submit', () => {
    // test implementation
  });

  it('should display error message when API fails', async () => {
    // test implementation
  });
});
```

## 📖 Documentación

### Componentes
```typescript
/**
 * Componente para mostrar información de incidentes
 * @param incident - Objeto con datos del incidente
 * @param onEdit - Función callback para editar incidente
 */
interface IncidentCardProps {
  incident: Incident;
  onEdit: (id: string) => void;
}
```

### Funciones Complejas
```typescript
/**
 * Calcula el total de pérdidas económicas por tipo de incidente
 * @param incidents - Array de incidentes
 * @param type - Tipo de incidente a filtrar
 * @returns Total de pérdidas en guaraníes
 */
function calculateLossesByType(incidents: Incident[], type: IncidentType): number {
  // implementation
}
```

## 🚨 Errores Comunes y Soluciones

### Errores de Linting
```bash
# Error: Missing dependencies in useEffect
# Solución: Agregar todas las dependencias al array de useEffect

# Error: Unused variable
# Solución: Remover la variable o usar underscore prefix: _unusedVar
```

### Errores de TypeScript
```bash
# Error: Type assertion
# ❌ Evitar: (data as any).someProperty
# ✅ Usar: proper typing o type guards
```

### Errores de Importación
```bash
# ❌ Relative imports
import Button from '../../../components/ui/button';

# ✅ Absolute imports
import { Button } from '@/components/ui/button';
```

## 🔗 Recursos Útiles

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Components](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)

## 🤝 Comunicación

### Canales de Comunicación
- **Issues**: Para reportar bugs o solicitar features
- **Discussions**: Para preguntas generales
- **PR Comments**: Para feedback específico de código

### Código de Conducta
- Sé respetoso y constructivo en todos los comentarios
- Acepta feedback de manera positiva
- Ayuda a otros desarrolladores cuando sea posible
- Mantén un ambiente de trabajo colaborativo

---

¡Gracias por contribuir a PW Retails! 🚀

**Contacto**: Si tienes preguntas sobre esta guía, no dudes en abrir un issue o contactar al equipo de desarrollo. 