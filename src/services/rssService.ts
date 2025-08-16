import Parser from 'rss-parser';
import { Article } from '../types';
import { config } from '../config';

export class RSSService {
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['category', 'categories'],
      },
    });
  }

  async fetchAllArticles(): Promise<Article[]> {
    console.log('🔍 Recopilando artículos de RSS feeds...');
    const allArticles: Article[] = [];

    for (const feedUrl of config.rss.feeds) {
      try {
        console.log(`📡 Procesando feed: ${feedUrl}`);
        const feed = await this.parser.parseURL(feedUrl);
        
        const articles = feed.items.map(item => ({
          title: item.title || 'Sin título',
          link: item.link || '',
          description: item.contentSnippet || item.description || 'Sin descripción',
          content: item.content || item.description || '',
          pubDate: item.pubDate || '',
          author: item.creator || item.author || 'Desconocido',
          categories: this.extractCategories(item),
          tags: this.extractTags(item),
          source: this.getSourceName(feedUrl),
        }));

        allArticles.push(...articles);
        console.log(`✅ ${articles.length} artículos encontrados en ${this.getSourceName(feedUrl)}`);
        
      } catch (error) {
        console.error(`❌ Error procesando feed ${feedUrl}:`, error);
      }
    }

    // Limitar al número máximo configurado para Deep Research
    const limitedArticles = allArticles.slice(0, config.rss.maxArticlesForDeepResearch);
    console.log(`📚 Total de artículos recopilados: ${limitedArticles.length} (limitado para Deep Research)`);
    
    return limitedArticles;
  }

  private extractCategories(item: any): string[] {
    const categories: string[] = [];
    
    if (item.categories) {
      if (Array.isArray(item.categories)) {
        categories.push(...item.categories);
      } else {
        categories.push(item.categories);
      }
    }
    
    if (item.category) {
      if (Array.isArray(item.category)) {
        categories.push(...item.category);
      } else {
        categories.push(item.category);
      }
    }
    
    return categories.filter(cat => cat && cat.trim() !== '');
  }

  private extractTags(item: any): string[] {
    // Similar a categories, pero podemos agregar lógica específica para tags
    return this.extractCategories(item);
  }

  private getSourceName(feedUrl: string): string {
    if (feedUrl.includes('uxdesign.cc')) return 'UX Collective';
    if (feedUrl.includes('smashingmagazine.com')) return 'Smashing Magazine';
    
    // Extraer nombre del dominio
    try {
      const domain = new URL(feedUrl).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'Unknown Source';
    }
  }
}
