-- Migration: Add analytics fields to articles table
-- Fecha: 2025-08-29
-- Descripción: Agregar campos para métricas del artículo

-- Agregar columnas de métricas
ALTER TABLE articles 
ADD COLUMN word_count INTEGER DEFAULT 0,
ADD COLUMN estimated_read_time INTEGER DEFAULT 0,
ADD COLUMN seo_score DECIMAL(3,1) DEFAULT 0.0;

-- Agregar índices para las nuevas columnas
CREATE INDEX idx_articles_word_count ON articles(word_count);
CREATE INDEX idx_articles_read_time ON articles(estimated_read_time);
CREATE INDEX idx_articles_seo_score ON articles(seo_score);

-- Actualizar artículos existentes para calcular word_count y estimated_read_time
UPDATE articles 
SET 
    word_count = COALESCE(array_length(string_to_array(trim(content), ' '), 1), 0),
    estimated_read_time = GREATEST(1, ROUND(COALESCE(array_length(string_to_array(trim(content), ' '), 1), 0) / 200.0))
WHERE content IS NOT NULL AND content != '';
