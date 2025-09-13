import { Request, Response } from 'express';
import { SupabaseService } from '../services/supabaseService';
import { OpenAIService } from '../services/openaiService';
import { ApiResponse, Article, CreateArticleRequest } from '../interfaces/interfaces';

export class ArticlesController {
    private supabaseService: SupabaseService;
    private openaiService: OpenAIService;

    constructor() {
        this.supabaseService = new SupabaseService();
        this.openaiService = new OpenAIService();
    }

    // GET /api/articles - Obtener todos los artículos
    async getArticles(req: Request, res: Response) {
        try {
            const articles = await this.supabaseService.getArticles();
            
            const response: ApiResponse<Article[]> = {
                success: true,
                data: articles,
                message: `Found ${articles.length} articles`
            };

            res.json(response);
        } catch (error) {
            console.error('Error fetching articles:', error);
            
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };

            res.status(500).json(response);
        }
    }

    // GET /api/articles/:id - Obtener un artículo específico
    async getArticleById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const article = await this.supabaseService.getArticleById(id);

            if (!article) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: 'Article not found'
                };
                return res.status(404).json(response);
            }

            const response: ApiResponse<Article> = {
                success: true,
                data: article
            };

            res.json(response);
        } catch (error) {
            console.error('Error fetching article:', error);
            
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };

            res.status(500).json(response);
        }
    }

    // POST /api/articles/generate - Generar nuevo artículo
    async generateArticle(req: Request, res: Response) {
        try {
            const { topic, segment, author }: CreateArticleRequest & { segment?: string; author?: string } = req.body;

            if (!topic || topic.trim() === '') {
                const response: ApiResponse<null> = {
                    success: false,
                    error: 'Topic is required'
                };
                return res.status(400).json(response);
            }

            console.log(`🚀 Iniciando generación de artículo sobre: "${topic}"`);

            // Paso 1: Búsqueda web con Tavily
            console.log('🌐 Paso 1: Realizando búsqueda web...');
            const webResults = await this.openaiService.searchWeb(topic);
            
            // Crear ResearchResult desde los resultados web
            const researchData: { content: string; sources: string[] } = {
                content: webResults.map(result => `${result.title}: ${result.content}`).join('\n\n'),
                sources: webResults.map(result => result.url)
            };

            // Paso 2: Generar artículo
            console.log('📝 Paso 2: Generando artículo...');
            const generatedArticle = await this.openaiService.generateArticle(topic, researchData);

            // Paso 3: Generar imagen de cabecera
            console.log('🎨 Paso 3: Generando imagen de cabecera...');
            const imageBuffer = await this.openaiService.generateHeaderImage(
                generatedArticle.header_image_prompt || generatedArticle.title
            );

            // Paso 4: Subir imagen a Supabase
            console.log('☁️ Paso 4: Subiendo imagen a Supabase...');
            const image_url = await this.supabaseService.uploadImage(
                imageBuffer,
                `${generatedArticle.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.jpg`
            );

            // Paso 5: Guardar artículo en Supabase
            console.log('💾 Paso 5: Guardando artículo en base de datos...');
            const savedArticle = await this.supabaseService.createArticle(generatedArticle, image_url);

            console.log(`✅ Artículo generado y guardado exitosamente: "${savedArticle.title}"`);

            const response: ApiResponse<Article> = {
                success: true,
                data: savedArticle,
                message: 'Article generated and saved successfully'
            };

            res.status(201).json(response);
        } catch (error) {
            console.error('❌ Error generating article:', error);
            
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate article'
            };

            res.status(500).json(response);
        }
    }

    // PUT /api/articles/:id - Actualizar artículo
    async updateArticle(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updates = req.body;

            console.log('🔄 [ArticlesController] Actualizando artículo:', {
                id,
                updates: Object.keys(updates),
                status: updates.status
            });

            // Verificar que el artículo existe
            const existingArticle = await this.supabaseService.getArticleById(id);
            if (!existingArticle) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: 'Article not found'
                };
                return res.status(404).json(response);
            }

            // Actualizar artículo
            const updatedArticle = await this.supabaseService.updateArticle(id, updates);

            console.log('✅ [ArticlesController] Artículo actualizado exitosamente:', {
                id: updatedArticle.id,
                status: updatedArticle.status,
                title: updatedArticle.title
            });

            const response: ApiResponse<Article> = {
                success: true,
                data: updatedArticle,
                message: 'Article updated successfully'
            };

            res.json(response);
        } catch (error) {
            console.error('❌ [ArticlesController] Error updating article:', error);
            
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };

            res.status(500).json(response);
        }
    }

    // DELETE /api/articles/:id - Eliminar artículo
    async deleteArticle(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Verificar que el artículo existe
            const existingArticle = await this.supabaseService.getArticleById(id);
            if (!existingArticle) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: 'Article not found'
                };
                return res.status(404).json(response);
            }

            // Eliminar imagen si existe
            if (existingArticle.image_url) {
                await this.supabaseService.deleteImage(existingArticle.image_url);
            }

            // Eliminar artículo
            await this.supabaseService.deleteArticle(id);

            const response: ApiResponse<null> = {
                success: true,
                message: 'Article deleted successfully'
            };

            res.json(response);
        } catch (error) {
            console.error('Error deleting article:', error);
            
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };

            res.status(500).json(response);
        }
    }

    // DEBUG: Test image generation
    async testImageGeneration(req: Request, res: Response) {
        try {
            console.log('🧪 Ejecutando test de generación de imágenes...');
            
            await this.openaiService.testImageGeneration();
            
            const response: ApiResponse<string> = {
                success: true,
                data: 'Test completado - revisa los logs del servidor',
                message: 'Image generation test completed'
            };

            res.json(response);
        } catch (error) {
            console.error('Error in image test:', error);
            
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };

            res.status(500).json(response);
        }
    }

    // POST /api/articles/:id/export - Exportar artículo para web
    async exportToWeb(req: Request, res: Response) {
        try {
            const { id } = req.params;
            console.log('🌐 [Export] Iniciando exportación para artículo:', id);

            // Obtener artículo
            const article = await this.supabaseService.getArticleById(id);
            if (!article) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: 'Article not found'
                };
                return res.status(404).json(response);
            }

            console.log('📄 [Export] Artículo encontrado:', article.title);

            // Generar archivo ZIP con contenido exportado
            const zipBuffer = await this.openaiService.exportArticleToWeb(article);

            // Configurar headers para descarga
            const filename = `article-${article.id}-export.zip`;
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', zipBuffer.length);

            console.log('✅ [Export] Enviando archivo ZIP:', filename);
            res.send(zipBuffer);

        } catch (error) {
            console.error('💥 [Export] Error en exportación:', error);
            
            const response: ApiResponse<null> = {
                success: false,
                error: error instanceof Error ? error.message : 'Export failed'
            };

            res.status(500).json(response);
        }
    }
}
