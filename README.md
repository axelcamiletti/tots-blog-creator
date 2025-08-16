# TOTS Blog Creator 🤖

Automatización inteligente para crear artículos de blog de alta calidad usando inteligencia artificial.

## 🚀 Características

- **Recopilación automática** de artículos desde feeds RSS
- **Selección inteligente** del mejor artículo usando IA
- **Investigación profunda** automatizada del tema
- **Generación de contenido** optimizado para SEO
- **Output HTML** listo para publicar

## 📋 Requisitos

- Node.js 18+ 
- API Key de OpenAI
- Conexión a internet

## ⚙️ Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd tots-blog-creator
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura tu API Key de OpenAI en `.env`:
```bash
OPENAI_API_KEY=tu-api-key-aqui
```

## 🎯 Uso

### Ejecutar el proceso completo:
```bash
npm run create-article
```

### Para desarrollo:
```bash
npm run dev
```

### Compilar TypeScript:
```bash
npm run build
```

## 🔧 Configuración

Edita el archivo `.env` para personalizar:

```env
# Tu API Key de OpenAI
OPENAI_API_KEY=sk-proj-...

# URLs de RSS Feeds (agrega los que necesites)
UX_COLLECTIVE_RSS=https://uxdesign.cc/feed
SMASHING_MAGAZINE_RSS=https://www.smashingmagazine.com/feed/

# Configuración
MAX_ARTICLES=100
OUTPUT_DIR=./output
```

## 📁 Estructura del Proyecto

```
src/
├── services/
│   ├── rssService.ts      # Recopilación de artículos RSS
│   ├── openaiService.ts   # Integración con OpenAI
│   └── htmlService.ts     # Generación de HTML
├── types/
│   └── index.ts           # Tipos TypeScript
├── config.ts              # Configuración
├── blogCreator.ts         # Orquestador principal
└── index.ts               # Punto de entrada
```

## 🔄 Proceso de Automatización

1. **📡 Recopilación**: Extrae ~100 artículos de feeds RSS configurados
2. **🤖 Selección IA**: OpenAI analiza y selecciona el mejor artículo
3. **🔬 Investigación**: Investigación profunda del tema seleccionado
4. **✍️ Generación**: Crea un artículo optimizado y original
5. **🎨 Elementos adicionales**: Meta tags, imagen header, tags, etc.
6. **📄 Output HTML**: Artículo completo listo para publicar

## 🎨 Personalización

### Agregar nuevos feeds RSS:
Edita `config.ts` y agrega URLs en el array `feeds`:

```typescript
feeds: [
  'https://uxdesign.cc/feed',
  'https://www.smashingmagazine.com/feed/',
  'https://tu-nuevo-feed.com/rss',
]
```

### Modificar criterios de selección:
Edita el prompt en `openaiService.ts` método `selectBestArticle()`.

### Personalizar HTML template:
Modifica `htmlService.ts` método `generateHTML()`.

## 📊 Salida

El proceso genera:
- **Archivo HTML** completo con el artículo
- **Metadatos SEO** optimizados
- **Información de investigación**
- **Datos del artículo original**
- **Sugerencias de imagen**

## 🛠️ Scripts Disponibles

- `npm run create-article` - Ejecuta el proceso completo
- `npm run dev` - Ejecuta en modo desarrollo
- `npm run build` - Compila TypeScript
- `npm start` - Ejecuta la versión compilada
- `npm run watch` - Compila en modo watch

## 🐛 Troubleshooting

### Error de API Key:
Verifica que tu `OPENAI_API_KEY` esté correctamente configurada en `.env`.

### Error de feeds RSS:
Algunos feeds pueden estar temporalmente no disponibles. El sistema continuará con los feeds funcionando.

### Error de compilación:
Ejecuta `npm install` para asegurar que todas las dependencias estén instaladas.

## 📝 Licencia

MIT License - Mira el archivo LICENSE para detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor abre un issue primero para discutir cambios importantes.

---

Desarrollado con ❤️ para automatizar la creación de contenido de calidad.
