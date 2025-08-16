import { RSSService } from './services/rssService';
import { OpenAIService } from './services/openaiService';
import { HTMLService } from './services/htmlService';
import { BlogCreationResult } from './types';

export class BlogCreator {
  private rssService: RSSService;
  private openaiService: OpenAIService;
  private htmlService: HTMLService;

  constructor() {
    this.rssService = new RSSService();
    this.openaiService = new OpenAIService();
    this.htmlService = new HTMLService();
  }

  async createBlogPost(): Promise<BlogCreationResult> {
    console.log('🚀 Iniciando proceso de creación de blog...\n');
    
    try {
      // Paso 1: Recopilar artículos de RSS
      const articles = await this.rssService.fetchAllArticles();
      
      if (articles.length === 0) {
        throw new Error('No se encontraron artículos en los feeds RSS');
      }

      // Paso 2: Seleccionar el mejor artículo con IA
      const selectedArticle = await this.openaiService.selectBestArticle(articles);
      
      // Paso 3: Realizar investigación profunda
      const research = await this.openaiService.executeDeepResearch(selectedArticle);
      
      // Paso 4: Generar artículo final
      const generatedArticle = await this.openaiService.generateArticle(selectedArticle, research);
      
      // Paso 5: Crear HTML
      const htmlOutput = await this.htmlService.generateHTML(generatedArticle, selectedArticle, research);
      
      // Paso 6: Guardar archivo HTML
      const savedPath = await this.htmlService.saveHTML(htmlOutput);
      
      console.log('\n🎉 ¡Proceso completado exitosamente!');
      console.log(`📄 Archivo guardado en: ${savedPath}`);
      
      return {
        originalArticle: selectedArticle,
        research,
        generatedArticle,
        htmlOutput,
      };
      
    } catch (error) {
      console.error('\n❌ Error en el proceso:', error);
      throw error;
    }
  }

  async displaySummary(result: BlogCreationResult): Promise<void> {
    console.log('\n📊 RESUMEN DEL PROCESO:');
    console.log('================================');
    console.log(`🎯 Artículo seleccionado: "${result.originalArticle.title}"`);
    console.log(`📈 Puntuación: ${result.originalArticle.score}/100`);
    console.log(`🔍 Consulta de investigación: "${result.research.query}"`);
    console.log(`📚 Fuentes encontradas: ${result.research.sources.length}`);
    console.log(`⏱️ Tiempo de investigación: ${result.research.responseTime}s`);
    console.log(`✍️ Artículo generado: "${result.generatedArticle.title}"`);
    console.log('================================\n');
  }
}
