import OpenAI from 'openai';
import { GeneratedArticle, ResearchResult } from '../interfaces/interfaces';
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

    /* async executeArticleCreation(topic: string): Promise<ResearchResult> {
        console.log('🔍 Ejecutando investigación profunda sobre:', topic);

        try {

            const query = 'acá va el query del usuario';

            // Paso 3: Búsqueda web con Tavily
            const webResults = await this.searchWeb(query);
            
            
        } catch (error) {
            console.error('❌ Error en investigación profunda:', error);
            throw new Error(`Failed to execute deep research: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    } */

    /* private async clarifyResearchPrompt(topic: string): Promise<string> {
        console.log('🔍 Clarificando prompt para investigación profunda...');
        
        const instructions = `
Eres un asistente que mejora prompts de investigación. Tu trabajo es tomar una tarea de investigación básica y producir instrucciones detalladas para un investigador que completará la tarea.

DIRECTRICES:
1. **Maximizar Especificidad y Detalle**
- Incluir todas las preferencias conocidas del usuario y listar explícitamente atributos clave o dimensiones a considerar.

2. **Completar Dimensiones No Declaradas pero Necesarias**
- Si ciertos atributos son esenciales para un output significativo pero el usuario no los ha proporcionado, declarar explícitamente que son abiertos o sin restricción específica.

3. **Evitar Suposiciones No Justificadas**
- Si el usuario no ha proporcionado un detalle particular, no inventar uno.

4. **Usar Primera Persona**
- Redactar la solicitud desde la perspectiva del usuario.

5. **Fuentes y Idioma**
- Para contenido académico o científico, priorizar enlaces directos a papers originales o publicaciones oficiales.
- Responder en español a menos que se especifique otro idioma.

NO completes la investigación tú mismo, solo proporciona instrucciones sobre cómo completarla.`;

        const inputText = `
Investigar a profundidad sobre este tema para crear contenido de blog de alta calidad:

TEMA: ${topic}

Necesito una investigación exhaustiva que cubra contexto, tendencias actuales, puntos clave, conceptos relacionados, opiniones de expertos y estadísticas relevantes.`;

        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4.1',
                messages: [{ 
                    role: 'system', 
                    content: instructions 
                }, { 
                    role: 'user', 
                    content: inputText 
                }],
            });

            const clarifiedPrompt = response.choices[0].message.content || inputText;
            console.log('✅ Prompt clarificado correctamente');
            
            return clarifiedPrompt;
        } catch (error) {
            console.error('❌ Error clarificando prompt:', error);
            return inputText;
        }
    } */

    /* private async generateSearchQuery(topic: string): Promise<string> {
        console.log('🔍 Generando query para búsqueda web');

        const inputText = `Genera un texto de búsqueda optimizado para encontrar información relevante sobre: ${topic}

Responde solo con el texto de búsqueda, sin explicaciones adicionales.`;

        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4.1",
                messages: [{ 
                    role: 'user', 
                    content: inputText 
                }],
            });

            const searchQuery = response.choices[0].message.content || topic;
            console.log('✅ Query para búsqueda generado:', searchQuery);
            
            return searchQuery;
        } catch (error) {
            console.error('❌ Error generando query:', error);
            return topic;
        }
    } */

    async searchWeb(query: string): Promise<any[]> {
        console.log('🌐 Realizando búsqueda web con Tavily...');
        
        try {
            const results = await this.tabilyApiKey.search(query, {
                search_depth: "advanced",
                max_results: 5
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
                                    enum: ["draft", "in-progress", "published", "paused"],
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
}
