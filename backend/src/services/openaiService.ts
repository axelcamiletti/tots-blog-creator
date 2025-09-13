import OpenAI from 'openai';
import { GeneratedArticle, ResearchResult } from '../interfaces/interfaces';
import sharp from 'sharp';
import archiver from 'archiver';
import slugify from 'slugify';
import fetch from 'node-fetch';
const { tavily } = require("@tavily/core");


export class OpenAIService {
    private openai: OpenAI;
    private tabilyApiKey: any;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
        });
        
        this.tabilyApiKey = tavily({ apiKey: process.env.TAVILY_API_KEY! });
    }

    private cleanJsonResponse(content: string): string {
        content = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
        content = content.trim();
        return content;
    }


    async searchWeb(query: string): Promise<any[]> {
        console.log('🌐 Realizando búsqueda web con Tavily...');
        
        try {
            const results = await this.tabilyApiKey.search(query, {
                search_depth: "advanced",
                max_results: 10
            });

            console.log(`✅ Encontrados ${results.results.length} resultados web`);
            return results.results;
        } catch (error) {
            console.error('❌ Error en búsqueda web:', error);
            return [];
        }
    }


    async generateArticle(topic: string, researchData: ResearchResult): Promise<GeneratedArticle> {
        console.log('📝 Generando artículo con IA...');
        
        const prompt = `
Eres un experto redactor de contenido técnico. Crea un artículo de blog COMPLETO en formato Markdown sobre el tema: "${topic}"

INFORMACIÓN DE INVESTIGACIÓN:
${researchData.content}

FUENTES DISPONIBLES:
${researchData.sources.join('\n')}

REQUISITOS DEL ARTÍCULO:
1. **Formato**: Markdown estricto (.md)
2. **Estructura**: Título H1, subtítulos H2/H3, párrafos bien organizados
3. **Longitud**: 1500-2500 palabras
4. **Estilo**: Profesional, educativo, fácil de leer
5. **Elementos**: Listas, enlaces, citas relevantes
6. **SEO**: Optimizado para motores de búsqueda

EVITA ABSOLUTAMENTE:
- Inventar estadísticas o casos de estudio falsos
- Usar un tono robótico o demasiado estructurado
- Mencionar empresas específicas a menos que estén en las fuentes
- Crear listas excesivamente largas o formateadas artificialmente
- Sonar como contenido generado por IA

ASIGNACIONES AUTOMÁTICAS:
- segment: Selecciona el más apropiado entre "IA", "Apps móviles", "Sportech", "Ciberseguridad"
- author: "TOTS Team"
- status: "draft"
- sources: Incluye las URLs de las fuentes proporcionadas
- header_image_prompt: Crea un prompt detallado para generar una imagen conceptual evitando clichés
`;

        try {
            const response = await this.openai.responses.create({
                model: "o3",
                reasoning: { effort: "high" },
                input: [{ role: 'user', content: prompt }],
                text: {
                    format: {
                        type: "json_schema",
                        name: "article_response",
                        schema: {
                            type: "object",
                            properties: {
                                title: {
                                    type: "string",
                                    description: "Título principal del artículo"
                                },
                                meta_title: {
                                    type: "string",
                                    description: "Meta título SEO (50-60 caracteres)"
                                },
                                meta_description: {
                                    type: "string",
                                    description: "Meta descripción SEO (150-160 caracteres)"
                                },
                                content: {
                                    type: "string",
                                    description: "Contenido completo en formato Markdown"
                                },
                                segment: {
                                    type: "string",
                                    enum: ["IA", "Apps móviles", "Sportech", "Ciberseguridad"],
                                    description: "Segmento del artículo"
                                },
                                tags: {
                                    type: "array",
                                    items: {
                                        type: "string"
                                    },
                                    description: "Tags del artículo (3-5 tags)"
                                },
                                category: {
                                    type: "string",
                                    description: "Categoría principal del artículo"
                                },
                                author: {
                                    type: "string",
                                    description: "Autor del artículo"
                                },
                                sources: {
                                    type: "array",
                                    items: {
                                        type: "string"
                                    },
                                    description: "URLs de fuentes utilizadas"
                                },
                                status: {
                                    type: "string",
                                    enum: ["draft", "in-progress", "published", "paused", "ready-to-publish"],
                                    description: "Estado del artículo"
                                },
                                header_image_prompt: {
                                    type: "string",
                                    description: "Prompt para generar imagen de cabecera"
                                }
                            },
                            required: ["title", "meta_title", "meta_description", "content", "segment", "tags", "category", "author", "sources", "status", "header_image_prompt"],
                            additionalProperties: false
                        },
                        strict: true
                    }
                }
            });

            const article = JSON.parse(response.output_text || '{}');
            
            console.log(`✅ Artículo generado con structured output: "${article.title}"`);
            
            return article as GeneratedArticle;
        } catch (error) {
            console.error('❌ Error generando artículo:', error);
            throw new Error(`Failed to generate article: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }


    // Función de test para debuggear la respuesta de generación de imágenes
    async testImageGeneration(): Promise<void> {
        console.log('🧪 INICIANDO TEST DE GENERACIÓN DE IMÁGENES...');
        
        try {
            const testPrompt = "A simple blue square on white background";
            
            console.log('🔍 Enviando request a OpenAI con prompt:', testPrompt);
            
            const response = await this.openai.images.generate({
                model: "gpt-image-1",
                prompt: testPrompt,
                size: "1536x1024",
                quality: "high",
                n: 1
            });

            console.log('🔍 === ANÁLISIS COMPLETO DE RESPUESTA ===');
            console.log('🔍 Tipo de response:', typeof response);
            console.log('🔍 Propiedades de response:', Object.keys(response));
            console.log('🔍 Response completo:', JSON.stringify(response, null, 2));
            
            if (response.data) {
                console.log('🔍 response.data existe, longitud:', response.data.length);
                console.log('🔍 Tipo de response.data[0]:', typeof response.data[0]);
                console.log('🔍 Propiedades de response.data[0]:', Object.keys(response.data[0]));
                
                const imageData = response.data[0];
                console.log('🔍 imageData completo:', JSON.stringify(imageData, null, 2));
                
                // Verificar propiedades estándar
                console.log('🔍 imageData.url:', imageData.url || 'NO PRESENTE');
                console.log('🔍 imageData.b64_json:', imageData.b64_json ? 'PRESENTE (longitud: ' + imageData.b64_json.length + ')' : 'NO PRESENTE');
                
                // Verificar propiedades custom con casting
                const imageDataAny = imageData as any;
                console.log('🔍 Todas las propiedades:', Object.getOwnPropertyNames(imageData));
                
                for (const prop of Object.getOwnPropertyNames(imageData)) {
                    const value = imageDataAny[prop];
                    console.log(`🔍 ${prop}:`, typeof value, value?.constructor?.name || 'undefined');
                    if (typeof value === 'string' && value.length > 100) {
                        console.log(`🔍 ${prop} (truncado):`, value.substring(0, 100) + '...');
                    }
                }
            } else {
                console.log('❌ response.data NO EXISTE');
            }
            
            console.log('🧪 === FIN DEL TEST ===');
            
        } catch (error) {
            console.error('❌ Error en test de imagen:', error);
        }
    }

    async generateHeaderImage(header_image_prompt: string): Promise<Buffer> {
        console.log('🖼️ Generando imagen de cabecera del artículo...');
        console.log('📝 Prompt:', header_image_prompt);
        
        try {
            const response = await this.openai.images.generate({
                model: "gpt-image-1",
                prompt: header_image_prompt,
                size: "1536x1024",
                quality: "high",
                n: 1
            });

            console.log('🔍 Verificando respuesta de GPT-IMAGE-1...');
            
            if (!response.data || response.data.length === 0) {
                throw new Error('No se generó ninguna imagen');
            }

            const imageData = response.data[0];
            
            // La imagen está en b64_json según el test
            if (imageData.b64_json) {
                console.log('✅ Imagen recibida en formato base64, longitud:', imageData.b64_json.length);
                const buffer = Buffer.from(imageData.b64_json, 'base64');
                console.log('✅ Imagen convertida a buffer correctamente, tamaño:', buffer.length, 'bytes');
                return buffer;
            }
            
            // Fallback a URL si está disponible (aunque según el test no debería estar)
            if (imageData.url) {
                console.log('✅ Imagen recibida como URL, descargando...');
                const imageResponse = await fetch(imageData.url);
                if (!imageResponse.ok) {
                    throw new Error(`Error descargando imagen: ${imageResponse.statusText}`);
                }

                const arrayBuffer = await imageResponse.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                console.log('✅ Imagen descargada y convertida correctamente');
                return buffer;
            }
            
            console.error('❌ No se encontró imagen en b64_json ni url');
            console.error('❌ Propiedades disponibles:', Object.keys(imageData));
            throw new Error('No se recibió imagen en formato esperado');

        } catch (error) {
            console.error('❌ Error generando imagen:', error);
            throw new Error(`Error crítico generando imagen: ${error}`);
        }
    }

    // Método principal para exportar artículo a formato web
    async exportArticleToWeb(article: any): Promise<Buffer> {
        console.log('🌐 [Export] Iniciando exportación completa para:', article.title);

        try {
            // 1. Traducir contenido a inglés
            console.log('🔄 [Export] Paso 1: Traduciendo contenido...');
            const translatedContent = await this.translateArticleToEnglish(article);

            // 2. Convertir markdown a HTML
            console.log('🔄 [Export] Paso 2: Convirtiendo markdown a HTML...');
            const htmlContent = await this.convertMarkdownToHtml(article.content, translatedContent.content_en);

            // 3. Procesar imágenes
            console.log('🔄 [Export] Paso 3: Procesando imágenes...');
            const imageFiles = await this.processHeaderImage(article.image_url);

            // 4. Generar slugs
            console.log('🔄 [Export] Paso 4: Generando slugs...');
            const slugs = this.generateSlugs(article.title, translatedContent.title_en);

            // 5. Crear JSON final
            console.log('🔄 [Export] Paso 5: Creando JSON...');
            const exportData = {
                meta_title_es: article.meta_title,
                meta_title_en: translatedContent.meta_title_en,
                meta_description_es: article.meta_description,
                meta_description_en: translatedContent.meta_description_en,
                title_es: article.title,
                title_en: translatedContent.title_en,
                slug_es: slugs.slug_es,
                slug_en: slugs.slug_en,
                content_es: htmlContent.content_es,
                content_en: htmlContent.content_en,
                author: article.author,
                header_image_url: 'images/header',
                created_date: article.created_at,
                category: article.segment,
                sources: article.sources || [],
                tags_es: article.tags || [],
                tags_en: translatedContent.tags_en || []
            };

            // 6. Crear archivo ZIP
            console.log('🔄 [Export] Paso 6: Creando archivo ZIP...');
            const zipBuffer = await this.createExportZip(exportData, imageFiles);

            console.log('✅ [Export] Exportación completada exitosamente');
            return zipBuffer;

        } catch (error) {
            console.error('💥 [Export] Error en exportación:', error);
            throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Traducir artículo completo a inglés
    private async translateArticleToEnglish(article: any): Promise<any> {
        console.log('🌐 [Export] Traduciendo artículo a inglés...');

        const prompt = `
Eres un traductor experto especializado en contenido técnico. Traduce el siguiente artículo del español al inglés, manteniendo:

1. El formato markdown exacto
2. La estructura y estilo del contenido
3. La terminología técnica apropiada
4. El tono profesional

Artículo a traducir:
- Título: "${article.title}"
- Meta título: "${article.meta_title}"
- Meta descripción: "${article.meta_description}"
- Contenido: 
${article.content}
- Tags: ${article.tags?.join(', ') || 'N/A'}

Responde ÚNICAMENTE con un JSON válido`;

        try {
            const response = await this.openai.responses.create({
                model: "gpt-5",
                input: prompt,
                reasoning: { effort: "low" },
                text: {
                    format: {
                        type: "json_schema",
                        name: "article_translate",
                        schema: {
                            type: "object",
                            properties: {
                                title_en: {
                                    type: "string",
                                    description: "Título principal del artículo en inglés"
                                },
                                meta_title_en: {
                                    type: "string",
                                    description: "Meta título del artículo en inglés"
                                },
                                meta_description_en: {
                                    type: "string",
                                    description: "Meta descripción SEO (150-160 caracteres) en inglés"
                                },
                                content_en: {
                                    type: "string",
                                    description: "Contenido completo en formato Markdown"
                                },
                                tags_en: {
                                    type: "array",
                                    items: {
                                        type: "string"
                                    },
                                    description: "Tags del artículo (3-5 tags) en inglés"
                                },
                            },
                            required: ["title_en", "meta_title_en", "meta_description_en", "content_en", "tags_en"],
                            additionalProperties: false
                        },
                        strict: true
                    }
                }
            });

            const articleTranslate = JSON.parse(response.output_text || '{}');
            
            console.log(`✅ Artículo traducido con structured output: "${article.title}"`);

            return articleTranslate;

            /* const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No se recibió respuesta de OpenAI para traducción');
            }

            const cleanedContent = this.cleanJsonResponse(content);
            return JSON.parse(cleanedContent); */

        } catch (error) {
            console.error('❌ Error en traducción:', error);
            throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Convertir markdown a HTML usando OpenAI
    private async convertMarkdownToHtml(content_es: string, content_en: string): Promise<any> {
        console.log('📝 [Export] Convirtiendo markdown a HTML...');

        const prompt = `
Eres un experto en conversión de markdown a HTML. Convierte el siguiente contenido markdown a HTML limpio y semántico, siguiendo estas reglas:

1. Usar etiquetas HTML semánticas apropiadas
2. Mantener la estructura jerárquica del contenido
3. Usar clases CSS descriptivas cuando sea necesario
4. Asegurar que el HTML sea válido y bien formateado
5. No incluir etiquetas <html>, <head> o <body>, solo el contenido del artículo

Contenido en español:
${content_es}

Contenido en inglés:
${content_en}

Responde ÚNICAMENTE con un JSON válido.
`;

        try {
            /* const response = await this.openai.chat.completions.create({
                model: "gpt-5",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,
                max_tokens: 4000
            });

            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No se recibió respuesta de OpenAI para conversión HTML');
            }

            const cleanedContent = this.cleanJsonResponse(content);
            return JSON.parse(cleanedContent); */


            const response = await this.openai.responses.create({
                model: "gpt-5",
                input: prompt,
                reasoning: { effort: "low" },
                text: {
                    format: {
                        type: "json_schema",
                        name: "article_converted_to_html",
                        schema: {
                            type: "object",
                            properties: {
                                content_es: {
                                    type: "string",
                                    description: "HTML del articulo en español"
                                },
                                content_en: {
                                    type: "string",
                                    description: "HTML del articulo en inglés"
                                },
                            },
                            required: ["content_es", "content_en"],
                            additionalProperties: false
                        },
                        strict: true
                    }
                }
            });

            const articleConverted = JSON.parse(response.output_text || '{}');
            
            console.log(`✅ Artículo convertido exitosamente`);

            return articleConverted;


        } catch (error) {
            console.error('❌ Error en conversión HTML:', error);
            throw new Error(`HTML conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Procesar imagen del header en múltiples formatos y tamaños
    private async processHeaderImage(imageUrl: string): Promise<{ [key: string]: Buffer }> {
        console.log('🖼️ [Export] Procesando imagen del header...');

        if (!imageUrl) {
            throw new Error('No hay imagen de header para procesar');
        }

        try {
            // Descargar imagen original
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to download image: ${response.statusText}`);
            }

            const imageBuffer = Buffer.from(await response.arrayBuffer());

            // Generar todas las variaciones
            const imageFiles: { [key: string]: Buffer } = {};

            const sizes = [
                { suffix: '1x', width: 800 },
                { suffix: '2x', width: 1600 },
                { suffix: '3x', width: 2400 }
            ];

            for (const size of sizes) {
                // JPG version
                imageFiles[`header-${size.suffix}.jpg`] = await sharp(imageBuffer)
                    .resize(size.width, null, { withoutEnlargement: true })
                    .jpeg({ quality: 85 })
                    .toBuffer();

                // WebP version
                imageFiles[`header-${size.suffix}.webp`] = await sharp(imageBuffer)
                    .resize(size.width, null, { withoutEnlargement: true })
                    .webp({ quality: 85 })
                    .toBuffer();
            }

            console.log('✅ [Export] Imágenes procesadas:', Object.keys(imageFiles));
            return imageFiles;

        } catch (error) {
            console.error('❌ Error procesando imagen:', error);
            throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Generar slugs para URLs
    private generateSlugs(title_es: string, title_en: string): any {
        console.log('🔗 [Export] Generando slugs...');

        const slugEs = slugify(title_es, {
            lower: true,
            strict: true,
            locale: 'es'
        });

        const slugEn = slugify(title_en, {
            lower: true,
            strict: true,
            locale: 'en'
        });

        return { slug_es: slugEs, slug_en: slugEn };
    }

    // Crear archivo ZIP con todo el contenido
    private async createExportZip(exportData: any, imageFiles: { [key: string]: Buffer }): Promise<Buffer> {
        console.log('📦 [Export] Creando archivo ZIP...');

        return new Promise((resolve, reject) => {
            const archive = archiver('zip', { zlib: { level: 9 } });
            const buffers: Buffer[] = [];

            archive.on('data', (chunk: any) => {
                buffers.push(chunk);
            });

            archive.on('end', () => {
                const zipBuffer = Buffer.concat(buffers);
                console.log('✅ [Export] ZIP creado exitosamente, tamaño:', zipBuffer.length, 'bytes');
                resolve(zipBuffer);
            });

            archive.on('error', (error: any) => {
                console.error('❌ Error creando ZIP:', error);
                reject(error);
            });

            // Agregar archivo JSON
            archive.append(JSON.stringify(exportData, null, 2), { name: 'article-data.json' });

            // Agregar imágenes
            for (const [filename, buffer] of Object.entries(imageFiles)) {
                archive.append(buffer, { name: `images/${filename}` });
            }

            archive.finalize();
        });
    }
}
