# TOTS Blog Creator - Requirements Document

## 📋 Descripción General

Sistema de automatización para la creación de artículos de blog utilizando inteligencia artificial, con una interfaz web completa para gestión y edición de contenido.

## 🎯 Objetivos del Proyecto

### Objetivo Principal
Desarrollar una herramienta que permita generar artículos de blog de alta calidad de forma automatizada, eliminando la dependencia de fuentes RSS y proporcionando una interfaz web intuitiva para la gestión del contenido.

### Objetivos Específicos
- Generar artículos basados en temas ingresados manualmente por el usuario
- Realizar investigación profunda automática utilizando IA y búsqueda web
- Crear contenido en formato Markdown optimizado para SEO
- Generar imágenes de cabecera automáticamente
- Proporcionar interfaz de edición con vista previa
- Implementar sistema de persistencia robusto
- Facilitar el despliegue en plataformas cloud

## 👥 Usuarios Objetivo

- **Usuario Principal**: Tú y tu jefe
- **Tipo de Acceso**: Sin autenticación (acceso directo por URL)
- **Nivel Técnico**: Usuarios con conocimientos básicos de web

## 🔧 Requisitos Funcionales

### RF01 - Generación de Artículos
- **Descripción**: El sistema debe permitir generar artículos basados en un tema proporcionado por el usuario
- **Entrada**: Tema del artículo (texto libre)
- **Proceso**: 
  1. Búsqueda web automatizada
  2. Generación de contenido
  3. Creación de imagen de cabecera
- **Salida**: Artículo completo en formato Markdown

### RF02 - Investigación Automática
- **Descripción**: Realizar investigación web profunda sobre el tema especificado
- **Herramientas**: 
  - Tavily API para búsqueda web
  - Máximo 5 fuentes por investigación
- **Resultado**: Contenido investigado y fuentes documentadas

### RF03 - Gestión de Contenido
- **Descripción**: CRUD completo para artículos generados
- **Operaciones**:
  - Crear: Generación automática
  - Leer: Visualización en lista y detalle
  - Actualizar: Edición con vista previa Markdown
  - Eliminar: Eliminación con confirmación

### RF04 - Editor Markdown
- **Descripción**: Editor de texto enriquecido con soporte completo para Markdown
- **Características**:
  - Vista previa en tiempo real
  - Toolbar con herramientas de formato
  - Soporte para imágenes y enlaces
  - Contador de palabras y líneas

### RF05 - Sistema de Metadatos
- **Descripción**: Gestión completa de metadatos SEO y organización
- **Campos**:
  - Título y meta título
  - Meta descripción
  - Segmento (IA, Apps móviles, Sportech, Ciberseguridad)
  - Tags (array de palabras clave)
  - Categoría
  - Autor
  - Fuentes de investigación

### RF06 - Generación de Imágenes
- **Descripción**: Creación automática de imágenes de cabecera
- **Especificaciones**:
  - Modelo: gpt-image-1
  - Tamaño: 1024x1024px
  - Estilo: Profesional, minimalista, tech-focused
  - Almacenamiento permanente

### RF07 - Persistencia de Datos
- **Descripción**: Almacenamiento robusto de artículos e imágenes
- **Base de datos**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage para imágenes
- **Formato**: JSON/SQL para metadatos, Markdown para contenido

## 🏗️ Requisitos Técnicos

### RT01 - Arquitectura del Sistema
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: Angular 18+ con Standalone Components
- **Base de datos**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage
- **Estilo**: TailwindCSS

### RT02 - APIs Externas
- **OpenAI API**:
  - Modelos: gpt-4.1, o4-mini-deep-research, o3, gpt-image-1
  - Rate limits: Manejo de errores sin fallback
- **Tavily API**: Búsqueda web con profundidad "advanced"
- **Supabase API**: Gestión de datos y archivos

### RT03 - Configuración de Modelos IA
```
- Selección: gpt-4.1 (ya no se usa, eliminado RSS)
- Clarificación: o4-mini-deep-research
- Investigación: o4-mini-deep-research  
- Generación: o3
- Imágenes: gpt-image-1
```

### RT04 - Estructura de Datos
```sql
articles {
  id: UUID (primary key)
  title: TEXT
  meta_title: TEXT
  meta_description: TEXT
  content: TEXT (markdown)
  segment: ENUM('IA', 'Apps móviles', 'Sportech', 'Ciberseguridad')
  tags: TEXT[]
  category: TEXT
  author: TEXT
  sources: TEXT[]
  image_url: TEXT
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

## 🚀 Requisitos de Despliegue

### RD01 - Backend (Render)
- **Plataforma**: Render.com
- **Configuración**: 
  - Runtime: Node.js 18+
  - Build: `npm run build`
  - Start: `npm start`
- **Variables de entorno**: OpenAI, Supabase, Tavily keys

### RD02 - Frontend (Vercel/Netlify)
- **Plataforma**: Vercel o Netlify
- **Build**: Angular production build
- **Configuración**: SPA routing, API proxy

### RD03 - Base de Datos (Supabase)
- **Servicio**: Supabase Cloud
- **Configuración**: 
  - Tablas con políticas RLS
  - Storage bucket público para imágenes
  - Índices para performance

## 🔒 Requisitos de Seguridad

### RS01 - Acceso
- **Autenticación**: No requerida (acceso por URL conocida)
- **Autorización**: Ninguna (acceso público)
- **Justificación**: Herramienta interna para 2 usuarios

### RS02 - Datos
- **Encriptación**: HTTPS en todas las comunicaciones
- **API Keys**: Almacenadas en variables de entorno
- **Backup**: Automático por Supabase

## 📊 Requisitos de Performance

### RP01 - Tiempos de Respuesta
- **Carga de lista**: < 2 segundos
- **Generación de artículo**: 2-5 minutos (esperado)
- **Guardado de ediciones**: < 3 segundos

### RP02 - Capacidad
- **Artículos**: Sin límite definido
- **Imágenes**: Hasta 1GB storage inicial
- **Usuarios concurrentes**: 2-5 usuarios máximo

## 🎨 Requisitos de UI/UX

### RU01 - Diseño
- **Framework**: TailwindCSS
- **Responsive**: Soporte para desktop y mobile
- **Tema**: Profesional, limpio, moderno

### RU02 - Usabilidad
- **Flujo principal**: 
  1. Ingreso de tema
  2. Generación automática (con feedback de progreso)
  3. Visualización de resultado
  4. Edición opcional
- **Feedback**: Estados de carga, errores claros, confirmaciones

### RU03 - Componentes Clave
- **Generador**: Formulario simple con opciones avanzadas
- **Lista**: Grid de artículos con filtros y estadísticas
- **Editor**: SimpleMDE con toolbar completo
- **Vista previa**: Preview de Markdown en tiempo real

## 📈 Criterios de Aceptación

### CA01 - Funcionalidad Básica
- ✅ Generar artículo desde tema ingresado
- ✅ Investigación automática con fuentes
- ✅ Contenido en formato Markdown
- ✅ Imagen de cabecera generada
- ✅ Guardado persistente

### CA02 - Interfaz Completa
- ✅ Lista de artículos con estadísticas
- ✅ Editor Markdown funcional
- ✅ CRUD completo de artículos
- ✅ Diseño responsive

### CA03 - Calidad del Contenido
- ✅ Artículos de 1500-2500 palabras
- ✅ Estructura clara con headers
- ✅ SEO optimizado
- ✅ Fuentes documentadas

## 🔄 Cambios Respecto a Versión Anterior

### Eliminado:
- ❌ Recolección automática de RSS feeds
- ❌ Selección automática de artículos
- ❌ Generación de HTML
- ❌ Almacenamiento local de archivos

### Agregado:
- ✅ Input manual de temas
- ✅ Interfaz web completa
- ✅ Editor Markdown con vista previa
- ✅ Base de datos PostgreSQL
- ✅ Storage cloud para imágenes
- ✅ Sistema de gestión completo

### Mejorado:
- 🔄 Investigación más profunda y específica
- 🔄 Mejor manejo de rate limits
- 🔄 Interfaz más intuitiva
- 🔄 Persistencia robusta
- 🔄 Deployment cloud-ready

## 📝 Notas Técnicas

### Decisiones de Arquitectura:
1. **Supabase vs Firebase**: Elegido por PostgreSQL real y mejor precio
2. **Render vs AWS**: Elegido por simplicidad y sin límites de tiempo
3. **SimpleMDE vs Custom**: Elegido por funcionalidad completa out-of-the-box
4. **Standalone Components**: Aprovecha Angular 18+ para bundle más pequeño

### Limitaciones Conocidas:
1. Sin autenticación (por diseño)
2. Sin backup automático de configuración
3. Dependiente de APIs externas
4. Sin versionado de artículos

---

**Documento creado**: Agosto 2025  
**Versión**: 1.0  
**Estado**: Implementación completada
