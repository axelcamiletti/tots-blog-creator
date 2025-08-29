# TOTS Blog Creator - Copilot Instructions

## 📋 Proyecto Overview
Este es el proyecto **TOTS Blog Creator**, un sistema de automatización para crear artículos de blog usando IA con una interfaz web completa.

### Arquitectura del Sistema:
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: Angular 18+ con Standalone Components
- **Base de datos**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage para imágenes
- **IA Services**: OpenAI (o3, gpt-image-1), Tavily API

## 🎯 Contexto del Desarrollo

### Flujo Principal de la Aplicación:
1. Usuario ingresa un tema manualmente
2. Sistema realiza búsqueda web profunda con Tavily API
3. IA (o3) genera artículo completo en Markdown
4. IA (gpt-image-1) genera imagen de cabecera
5. Todo se guarda en Supabase (PostgreSQL + Storage)

### Servicios Clave:
- `SupabaseService`: Manejo de DB y Storage
- `OpenAIService`: Generación de contenido e imágenes
- `searchWeb()`: Búsqueda con Tavily API
- `generateArticle()`: Generación con modelo o3
- `generateHeaderImage()`: Imágenes con gpt-image-1

## 🔧 Instrucciones para Backend (Node.js + TypeScript)

### Cuando trabajes en el backend:
- **Usar siempre TypeScript estricto** con tipado completo
- **Manejar errores** con try/catch y logs descriptivos
- **Variables de entorno** siempre desde process.env con validación
- **Async/await** para todas las operaciones asíncronas
- **Interfaces** definidas en `src/interfaces/interfaces.ts`

### Estructura de APIs:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### Modelos de IA Específicos:
- **Investigación**: `tavily` 
- **Generación**: `o3` con reasoning effort: "high"
- **Imágenes**: `gpt-image-1` tamaño 1536x1024

## 🎨 Instrucciones para Frontend (Angular 18+)

### Paradigmas Obligatorios:
- **Standalone Components** (NO NgModules)
- **Signals** para state management
- **ChangeDetectionStrategy.OnPush** siempre
- **Control flow nativo** (@if, @for, @switch)

### Patrones Requeridos:
```typescript
// Usar input() y output() signals
protected readonly articles = signal<Article[]>([]);
readonly isLoading = signal(false);

// Computed para estado derivado
readonly articlesCount = computed(() => this.articles().length);

// Usar inject() no constructor injection
private readonly http = inject(HttpClient);
```

### Componentes Principales:
- `ArticleGeneratorComponent`: Formulario para generar artículos
- `ArticleListComponent`: Lista con filtros y estadísticas  
- `ArticleEditorComponent`: Editor Markdown con vista previa
- `ArticleService`: Comunicación con backend API

## 🎯 TailwindCSS Guidelines

### Diseño Requerido:
- **Tema**: Profesional, limpio, moderno, tech-focused
- **Responsive**: Desktop y mobile
- **Colores**: Paleta tech (azules, grises, blancos)
- **Componentes**: Cards, buttons, forms con estilo consistente

### Clases Preferidas:
```css
/* Contenedores */
.container mx-auto px-4
.grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

/* Cards */
.bg-white rounded-lg shadow-md p-6
.border border-gray-200 hover:shadow-lg transition-shadow

/* Botones */
.bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md
.bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded
```

## 📊 Estructura de Datos

### Article Interface:
```typescript
interface Article {
  id: string;
  title: string;
  meta_title: string;
  meta_description: string;
  content: string; // Markdown
  segment: 'IA' | 'Apps móviles' | 'Sportech' | 'Ciberseguridad';
  tags: string[];
  category: string;
  author: string;
  sources: string[];
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}
```

## 🚨 Reglas Específicas del Proyecto

### Backend:
- **NUNCA** inventar estadísticas o datos falsos
- **SIEMPRE** manejar rate limits de APIs externas
- **Rate limits**: OpenAI y Tavily sin fallback
- **Logs descriptivos** con emojis para facilitar debugging
- **Supabase RLS**: Políticas públicas (sin autenticación)

### Frontend:
- **NO usar** `ngClass` o `ngStyle` (usar class/style bindings)
- **Editor Markdown**: SimpleMDE o similar con toolbar completo
- **Vista previa**: Real-time markdown preview
- **Loading states**: Para todas las operaciones async
- **Error handling**: Mensajes claros y accionables

### Flujo de Generación:
1. Validar input del usuario
2. Mostrar loading con progreso
3. Búsqueda web → Generación → Imagen → Guardado
4. Feedback visual en cada paso
5. Redirección a vista de artículo

## 🔄 APIs y Endpoints

### Backend Routes:
```
GET /api/articles - Listar artículos
GET /api/articles/:id - Obtener artículo específico  
POST /api/articles/generate - Generar nuevo artículo
PUT /api/articles/:id - Actualizar artículo
DELETE /api/articles/:id - Eliminar artículo
```

### Ejemplo de Request:
```typescript
// POST /api/articles/generate
{
  "topic": "Inteligencia Artificial en 2025",
  "segment": "IA",
  "author": "TOTS Team"
}
```

## 🎯 Prioridades de Desarrollo

1. **Performance**: Change detection optimizada con OnPush
2. **UX**: Loading states y feedback visual
3. **SEO**: Meta títulos y descripciones optimizadas
4. **Maintenance**: Código limpio y bien documentado
5. **Error handling**: Manejo robusto de errores de APIs

## 📝 Notas Importantes

- **Sin autenticación**: Acceso público por URL conocida
- **Deployment**: Backend en Render, Frontend en Vercel/Netlify
- **Environment**: Variables de entorno para todas las API keys
- **Storage**: Imágenes en Supabase Storage con URLs públicas
- **Content**: Artículos de 1500-2500 palabras en Markdown

---

**Siempre consulta estas instrucciones antes de hacer cambios significativos al código.**
