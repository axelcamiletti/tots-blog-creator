# TOTS Blog Creator API

Una API simple para extraer contenido de páginas web usando Mercury Parser.

## Descripción

Esta API permite extraer contenido estructurado de cualquier URL, incluyendo título, contenido, excerpt, fecha de publicación e imagen principal.

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/tots-blog-creator.git
cd tots-blog-creator
```

2. Instala las dependencias:
```bash
npm install
```

## Uso

1. Inicia el servidor:
```bash
node parse.js
```

2. El servidor estará disponible en `http://localhost:3000`

## Endpoints

### POST /scrape

Extrae contenido de una URL específica.

**Request:**
```json
{
  "url": "https://example.com/article"
}
```

**Response:**
```json
{
  "title": "Título del artículo",
  "content": "Contenido completo del artículo...",
  "excerpt": "Resumen del artículo",
  "date_published": "2025-07-18T10:00:00.000Z",
  "lead_image_url": "https://example.com/image.jpg",
  "source_url": "https://example.com/article"
}
```

## Dependencias

- Express.js - Framework web para Node.js
- @postlight/mercury-parser - Parser para extraer contenido de páginas web

## Licencia

ISC
