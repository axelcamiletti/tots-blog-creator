import OpenAI from 'openai';
import fs from "fs/promises";
import path from "path";
import { Article } from '../interfaces/interfaces';
const { tavily } = require("@tavily/core");

export class OpenAIService {
    /* private openai: OpenAI; */
    /* private tabilyApiKey = tavily({ apiKey: config.tavily.apiKey }); */

    /* constructor() {
        this.openai = new OpenAI({
        apiKey: config.openai.apiKey,
        });

    } */

    // private cleanJsonResponse(content: string): string {
    //    content = content.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    //    content = content.trim();
    //    return content;
    // }

    // Paso 1: Clarificación del prompt para Deep Research (según documentación)
    /* private async clarifyResearchPrompt(article: Article): Promise<string> {
        console.log('🔍 Clarificando y enriqueciendo prompt para investigación profunda...');
        
        const instructions = `
    Eres un asistente que mejora prompts de investigación. Tu trabajo es tomar una tarea de investigación básica y producir instrucciones detalladas para un investigador que completará la tarea.

    DIRECTRICES:
    1. **Maximizar Especificidad y Detalle**
    - Incluir todas las preferencias conocidas del usuario y listar explícitamente atributos clave o dimensiones a considerar.
    - Es de suma importancia que todos los detalles del usuario se incluyan en las instrucciones.

    2. **Completar Dimensiones No Declaradas pero Necesarias**
    - Si ciertos atributos son esenciales para un output significativo pero el usuario no los ha proporcionado, declarar explícitamente que son abiertos o sin restricción específica.

    3. **Evitar Suposiciones No Justificadas**
    - Si el usuario no ha proporcionado un detalle particular, no inventar uno.
    - En su lugar, declarar la falta de especificación y guiar al investigador a tratarlo como flexible.

    4. **Usar Primera Persona**
    - Redactar la solicitud desde la perspectiva del usuario.

    5. **Fuentes y Idioma**
    - Para contenido académico o científico, priorizar enlaces directos a papers originales o publicaciones oficiales.
    - Responder en español a menos que se especifique otro idioma.

    NO completes la investigación tú mismo, solo proporciona instrucciones sobre cómo completarla.`;

        const inputText = `
    Investigar a profundidad sobre este artículo para crear contenido de blog de alta calidad:

    ARTÍCULO SELECCIONADO:
    - Título: ${article.title}
    - Descripción: ${article.description}
    - Fuente: ${article.source}
    - Categorías: ${article.categories?.join(', ') || 'N/A'}
    - Razón de selección: ${article.selectionReason}

    Necesito una investigación exhaustiva que cubra contexto, tendencias actuales, puntos clave, conceptos relacionados, opiniones de expertos y estadísticas relevantes.`;

        try {
        const response = await this.openai.chat.completions.create({
            model: config.openai.clarificationModel,
            messages: [{ 
            role: 'system', 
            content: instructions 
            }, { 
            role: 'user', 
            content: inputText 
            }],
            max_tokens: config.openai.maxTokens,
            temperature: 0.3,
        });

        const clarifiedPrompt = response.choices[0].message.content || inputText;
        console.log('✅ Prompt clarificado y enriquecido');
        console.log('📝 Preview:', clarifiedPrompt.substring(0, 200) + '...');
        
        return clarifiedPrompt;
        } catch (error) {
        console.error('❌ Error clarificando prompt:', error);
        console.log('🔄 Usando prompt original como fallback');
        return inputText;
        }
    } */

    /* private async generateQuerySearchNavigator(article: Article): Promise<string> {
        console.log('🔍 Generando prompt para navegador web');

        const inputText = `Tienes que analizar cual es exactamente el tópico del siguiente articulo para generar un texto de búsqueda para navegador web. # Responde solo con el texto de búsqueda, sin explicaciones adicionales:

        - Título: ${article.title}
        - Descripción: ${article.description}
        - Fuente: ${article.source}
        - Categorías: ${article.categories?.join(', ') || 'N/A'}
        - Razón de selección: ${article.selectionReason}
        
        Texto de búsqueda:`;

        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4.1",
                messages: [{ 
                    role: 'user', 
                    content: inputText 
                }],
            });

            const clarifiedPrompt = response.choices[0].message.content || inputText;
            console.log('✅ Query para navegador generado correctamente');
            console.log('📝 Query:', clarifiedPrompt);
            
            return clarifiedPrompt;
        } catch (error) {
            console.error('❌ Error clarificando prompt:', error);
            console.log('🔄 Usando prompt original como fallback');
            return inputText;
        }
    } */

    /* async selectBestArticle(articles: Article[]): Promise<SelectedArticle> {
        console.log('🤖 Analizando artículos con IA para seleccionar el mejor...');
        
        const prompt = `
    Eres un experto editor de contenido digital. Analiza estos ${articles.length} artículos y selecciona EL MEJOR para crear contenido de blog de alta calidad.

    IMPORTANTE: DIVERSIDAD DE TEMAS - Evita sesgo hacia temas específicos. Considera TODOS los temas con igual importancia. No favorezcas automáticamente tecnología, IA o tendencias específicas sin justificación real.

    CRITERIOS DE SELECCIÓN (por orden de importancia):
    1. RELEVANCIA Y TENDENCIA: ¿Es un tema actual y relevante para la audiencia de diseño/UX?
    2. POTENCIAL DE CONTENIDO: ¿Tiene suficiente profundidad para un artículo extenso y educativo?
    3. DIVERSIDAD TEMÁTICA: ¿Aporta variedad frente a contenido típico de IA/tecnología?
    4. INTERÉS DE AUDIENCIA: ¿Será útil y práctico para diseñadores y desarrolladores?
    5. UNICIDAD: ¿Ofrece una perspectiva única o información valiosa?
    6. CALIDAD DE FUENTE: ¿Viene de una fuente respetable?

    NOTA: Valora positivamente temas como liderazgo, procesos de diseño, herramientas, psicología del usuario, accesibilidad, y otros aspectos fundamentales del diseño más allá de las tendencias tecnológicas.

    ARTÍCULOS:
    ${articles.map((article, index) => `
    ${index + 1}. TÍTULO: ${article.title}
    FUENTE: ${article.source}
    DESCRIPCIÓN: ${article.description.substring(0, 200)}...
    CATEGORÍAS: ${article.categories?.join(', ') || 'N/A'}
    LINK: ${article.link}
    `).join('\n')}

    RESPONDE EN FORMATO JSON:
    {
    "selectedIndex": [número del artículo seleccionado 1-${articles.length}],
    "selectionReason": "Explicación detallada de por qué este artículo es el mejor",
    "score": [puntuación 1-100],
    "keyStrengths": ["fortaleza1", "fortaleza2", "fortaleza3"]
    }`;

        try {
        // Usar gpt-4.1 para selección según documentación
        const response = await this.openai.chat.completions.create({
            model: config.openai.selectionModel,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: config.openai.maxTokens,
            temperature: 0.3, // Menos creatividad, más precisión en la selección
        });

        // Limpiar la respuesta de markdown si existe
        let content = response.choices[0].message.content || '{}';
        console.log('🔍 Respuesta cruda de OpenAI:', content.substring(0, 200) + '...');
        
        content = this.cleanJsonResponse(content);
        console.log('🧹 Respuesta limpia:', content.substring(0, 200) + '...');
        
        const result = JSON.parse(content);
        const selectedArticle = articles[result.selectedIndex - 1];
        
        console.log(`✅ Artículo seleccionado: "${selectedArticle.title}"`);
        console.log(`📊 Puntuación: ${result.score}/100`);
        console.log(`💡 Razón: ${result.selectionReason}`);

        return {
            ...selectedArticle,
            selectionReason: result.selectionReason,
            score: result.score,
        };
        } catch (error) {
        console.error('❌ Error seleccionando artículo:', error);
        throw new Error('Error en la selección de artículo con IA');
        }
    } */

    /* async executeDeepResearch(article: SelectedArticle): Promise<ResearchData> {
        console.log('🔬 Realizando investigación profunda del tema...');
        
        const queryNavigator = await this.generateQuerySearchNavigator(article);

        const searchResults = await this.tabilyApiKey.search(queryNavigator, {
            search_depth: "advanced",
            max_results: 5,
            answer: "advanced"
        })

        console.log('🔍 Resultados de búsqueda obtenidos de searchResults:');
        console.log(searchResults);

        const researchData: ResearchData = {
            query: searchResults.query || queryNavigator,
            responseTime: searchResults.responseTime || 0,
            sources: searchResults.results?.map((result: any) => ({
                title: result.title,
                url: result.url,
                content: result.content,
                score: result.score
            })) || []
        };

        console.log('✅ Investigación profunda completada');
        console.log(`📊 Encontradas ${researchData.sources.length} fuentes relevantes`);
        console.log(`⏱️ Tiempo de respuesta: ${researchData.responseTime}s`);

        return researchData;
    } */

    /* async generateArticle(originalArticle: SelectedArticle, research: ResearchData): Promise<GeneratedArticle> {
        console.log('✍️ Generando artículo final...');
        
        const sourcesInfo = research.sources.map((source, index) => 
            `${index + 1}. ${source.title} (${source.url})\n   Contenido completo: ${source.content}`
        ).join('\n\n');

        const prompt = `Eres un escritor senior especializado en UX/producto que escribe para una audiencia de diseñadores y PMs experimentados. 

Basándote en este artículo original y la investigación proporcionada, crea un artículo de blog que sea genuinamente útil y bien escrito.

ARTÍCULO ORIGINAL:
${originalArticle.title}
${originalArticle.description}
Fuente: ${originalArticle.source}

INVESTIGACIÓN COMPLETA:
${sourcesInfo}

CARACTERÍSTICAS DE UN BUEN ARTÍCULO:
- Fluye naturalmente, se lee como si lo escribiera un humano experto
- Usa ejemplos y datos REALES de las fuentes de investigación (no inventes casos)
- Estructura clara pero sin forzar formatos rígidos
- Aporta valor práctico que el lector pueda aplicar
- Tono profesional pero conversacional
- Entre 2000-3500 palabras de contenido sustancial

EVITA ABSOLUTAMENTE:
- Inventar estadísticas o casos de estudio falsos
- Usar un tono robótico o demasiado estructurado
- Mencionar empresas específicas a menos que estén en las fuentes
- Crear listas excesivamente largas o formateadas artificialmente
- Sonar como contenido generado por IA

Escribe el artículo completo en HTML con una estructura natural de h2, h3, p, ul, li según sea apropiado.

FORMATO DE RESPUESTA:
{
  "title": "Título atractivo y natural",
  "content": "Artículo completo en HTML con estructura orgánica",
  "metaTitle": "Meta título SEO (max 60 caracteres)",
  "metaDescription": "Meta descripción SEO (max 160 caracteres)",
  "headerImagePrompt": "Prompt para imagen conceptual evitando clichés"
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
        
        if (article.headerImagePrompt) {
            console.log('🖼️ Generando imagen de cabecera...');
            const headerImageUrl = await this.generateHeaderImageArticle(article.headerImagePrompt);
            article.headerImageUrl = headerImageUrl;
        }
        
        return article;
        } catch (error) {
        console.error('❌ Error generando artículo:', error);
        throw new Error('Error en la generación del artículo con IA');
        }
    } */

    /* private async generateHeaderImageArticle(headerImagePrompt: string): Promise<string> {
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
            
            const imageUrl = response.data?.[0]?.url;
            const imageB64 = response.data?.[0]?.b64_json;
            
            if (imageUrl) {
                console.log('✅ Imagen generada exitosamente (formato URL)');
                console.log('🔗 URL temporal:', imageUrl);
                
                console.log('💾 Descargando imagen para almacenamiento permanente...');
                
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const fileName = `header-${timestamp}.png`;
                const imagesDir = path.join('output', 'images');
                const imagePath = path.join(imagesDir, fileName);
                
                await fs.mkdir(imagesDir, { recursive: true });
                
                const imageResponse = await fetch(imageUrl);
                if (!imageResponse.ok) {
                    throw new Error(`Error descargando imagen: ${imageResponse.statusText}`);
                }
                
                const imageBuffer = await imageResponse.arrayBuffer();
                await fs.writeFile(imagePath, Buffer.from(imageBuffer));
                
                console.log('✅ Imagen guardada permanentemente en:', imagePath);
                return `./images/${fileName}`;
                
            } else if (imageB64) {
                console.log('✅ Imagen generada exitosamente (formato Base64)');
                
                // 💾 Guardar desde Base64
                console.log('💾 Guardando imagen desde datos Base64...');
                
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const fileName = `header-${timestamp}.png`;
                const imagesDir = path.join('output', 'images');
                const imagePath = path.join(imagesDir, fileName);
                
                await fs.mkdir(imagesDir, { recursive: true });
                
                // Convertir base64 a buffer y guardar
                const imageBuffer = Buffer.from(imageB64, 'base64');
                await fs.writeFile(imagePath, imageBuffer);
                
                console.log('✅ Imagen guardada permanentemente en:', imagePath);
                return `./images/${fileName}`;
                
            } else {
                console.error('❌ Estructura de respuesta inesperada:', response);
                throw new Error('No se recibió URL ni datos Base64 de imagen en la respuesta de GPT-IMAGE-1');
            }

        } catch (error) {
            console.error('❌ Error generando imagen:', error);
            throw new Error(`Error crítico generando imagen: ${error}`);
        }
    } */
}
