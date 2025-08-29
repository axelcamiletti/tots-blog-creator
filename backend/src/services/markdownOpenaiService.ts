import OpenAI from 'openai';
import { GeneratedArticle, ResearchResult } from '../interfaces/interfaces';
const { tavily } = require("@tavily/core");


export class OpenAIService {
    private openai: OpenAI;
    private tabilyApiKey = tavily({ apiKey: process.env.TAVILY_API_KEY! });

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
        });
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
            const results = await this.tabilyApiKey.search({
                query: query,
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

RESPONDE EN FORMATO JSON:
{
  "title": "Título principal del artículo",
  "metaTitle": "Meta título SEO (50-60 caracteres)",
  "metaDescription": "Meta descripción SEO (150-160 caracteres)",
  "content": "Contenido completo en Markdown",
  "headerImagePrompt": "Prompt para imagen conceptual evitando clichés"
  "tags": ["tag1", "tag2", "tag3"],
  "category": "Categoría principal",
}`;

        try {
            const response = await this.openai.responses.create({
                model: "o3",
                reasoning: { effort: "high" },
                input: [{ role: 'user', content: prompt }],
            });

            let content = response.output_text || '{}';
        
            const article = JSON.parse(content);
            
            console.log(`✅ Artículo generado: "${article.title}"`);
            
            return article as GeneratedArticle;
        } catch (error) {
            console.error('❌ Error generando artículo:', error);
            throw new Error(`Failed to generate article: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }


    async generateHeaderImage(headerImagePrompt: string): Promise<Buffer> {
        console.log('🖼️ Generando imagen de cabecera del artículo...');
        console.log('📝 Prompt:', headerImagePrompt);
        
        try {
            const response = await this.openai.images.generate({
                model: "gpt-image-1",
                prompt: headerImagePrompt,
                size: "1536x1024",
                quality: "high",
                n: 1,
            });

            console.log('🔍 Respuesta completa de GPT-IMAGE-1:', JSON.stringify(response, null, 2));
            
            if (!response.data || response.data.length === 0) {
                throw new Error('No se generó ninguna imagen');
            }

            const imageUrl = response.data[0].url;
            if (!imageUrl) {
                throw new Error('No se generó URL de imagen');
            }

            // Descargar la imagen y convertirla a Buffer
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
                throw new Error(`Error descargando imagen: ${imageResponse.statusText}`);
            }

            const arrayBuffer = await imageResponse.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            console.log('✅ Imagen generada y descargada correctamente');
            return buffer;

        } catch (error) {
            console.error('❌ Error generando imagen:', error);
            throw new Error(`Error crítico generando imagen: ${error}`);
        }
    }
}
