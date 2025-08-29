-- Storage Policies para el bucket article-images
-- Ejecutar en Storage > article-images > Policies

-- 1. Política para permitir INSERT (subir archivos)
CREATE POLICY "Allow public upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'article-images');

-- 2. Política para permitir SELECT (ver archivos)
CREATE POLICY "Allow public view" ON storage.objects 
FOR SELECT USING (bucket_id = 'article-images');

-- 3. Política para permitir DELETE (eliminar archivos)
CREATE POLICY "Allow public delete" ON storage.objects 
FOR DELETE USING (bucket_id = 'article-images');
