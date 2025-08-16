import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
    // Modelos según documentación Deep Research
    selectionModel: 'gpt-4.1', // Para selección de artículos y tareas rápidas
    clarificationModel: 'gpt-4.1', // Para clarificación y reescritura de prompts
    deepResearchModel: 'o4-mini-deep-research', // Para investigación profunda (balance costo/calidad)
    generationModel: 'gpt-4o-mini', // Para generación final de artículos
    maxTokens: 4000,
    deepResearchTimeout: 3600, // 1 hora para deep research
  },
  tavily: {
    apiKey: process.env.TAVILY_API_KEY!,
  },
  rss: {
    feeds: [
      process.env.UX_COLLECTIVE_RSS || 'https://uxdesign.cc/feed',
      process.env.SMASHING_MAGAZINE_RSS || 'https://www.smashingmagazine.com/feed/',
      // Agregar más feeds aquí
    ],
    maxArticles: parseInt(process.env.MAX_ARTICLES || '30'), // Reducido de 100 a 30 para Deep Research
    maxArticlesForDeepResearch: 20, // Límite específico para Deep Research
  },
  output: {
    directory: process.env.OUTPUT_DIR || './output',
  },
};
