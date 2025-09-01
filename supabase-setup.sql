-- TOTS Blog Creator - Supabase Database Setup
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Crear ENUMs
CREATE TYPE segment_type AS ENUM ('IA', 'Apps móviles', 'Sportech', 'Ciberseguridad');
CREATE TYPE article_status AS ENUM ('draft', 'in-progress', 'published', 'paused', 'ready-to-publish');

-- 2. Crear tabla articles
CREATE TABLE articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    content TEXT NOT NULL,
    segment segment_type,
    tags TEXT[] DEFAULT '{}',
    category TEXT,
    author TEXT DEFAULT 'TOTS Team',
    sources TEXT[] DEFAULT '{}',
    image_url TEXT,
    status article_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear índices para mejor performance
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_articles_segment ON articles(segment);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_tags ON articles USING GIN(tags);

-- 4. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Crear trigger para updated_at
CREATE TRIGGER update_articles_updated_at 
    BEFORE UPDATE ON articles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Habilitar Row Level Security (RLS) - opcional para mayor seguridad
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 7. Crear política para permitir todas las operaciones (sin autenticación)
CREATE POLICY "Allow all operations" ON articles FOR ALL USING (true);

-- 8. Insertar datos de ejemplo (opcional)
INSERT INTO articles (title, meta_title, meta_description, content, segment, tags, category, sources) VALUES 
(
    'Introducción a la Inteligencia Artificial en 2025',
    'IA en 2025: Guía Completa | TOTS Blog',
    'Descubre las últimas tendencias y avances en inteligencia artificial para el año 2025',
    '# Introducción a la Inteligencia Artificial en 2025

La inteligencia artificial continúa evolucionando a un ritmo acelerado...

## ¿Qué es la IA?

La inteligencia artificial es...

## Tendencias para 2025

Las principales tendencias incluyen...',
    'IA',
    ARRAY['inteligencia artificial', 'tecnología', '2025', 'trends'],
    'Tecnología',
    ARRAY['https://example.com/ai-trends', 'https://example.com/ai-2025']
);
