import fs from 'fs/promises';
import path from 'path';
import { GeneratedArticle, SelectedArticle, ResearchData } from '../types';
import { config } from '../config';

export class HTMLService {
  async generateHTML(
    generatedArticle: GeneratedArticle,
    originalArticle: SelectedArticle,
    research: ResearchData
  ): Promise<string> {
    console.log('🎨 Generando HTML final...');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${generatedArticle.metaTitle}</title>
    <meta name="description" content="${generatedArticle.metaDescription}">
    <meta name="keywords" content="blog, artículo, contenido">,
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${generatedArticle.title}">
    <meta property="og:description" content="${generatedArticle.metaDescription}">
    <meta property="og:type" content="article">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${generatedArticle.title}">
    <meta name="twitter:description" content="${generatedArticle.metaDescription}">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #fff;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .meta-info {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 20px;
            font-size: 0.9em;
            opacity: 0.9;
        }
        
        .meta-info span {
            background: rgba(255,255,255,0.2);
            padding: 5px 10px;
            border-radius: 15px;
        }
        
        .tags {
            display: flex;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .tag {
            background: rgba(255,255,255,0.2);
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8em;
        }
        
        .image-placeholder {
            width: 100%;
            height: 300px;
            background: linear-gradient(45deg, #f0f2f5, #e1e5e9);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 30px 0;
            border: 2px dashed #ccc;
        }
        
        .image-prompt {
            text-align: center;
            color: #666;
            padding: 20px;
        }
        
        .content {
            margin: 40px 0;
        }
        
        .content h2 {
            color: #2c3e50;
            margin: 30px 0 15px 0;
            font-size: 1.8em;
            border-left: 4px solid #667eea;
            padding-left: 15px;
        }
        
        .content h3 {
            color: #34495e;
            margin: 25px 0 10px 0;
            font-size: 1.4em;
        }
        
        .content p {
            margin: 15px 0;
            text-align: justify;
            font-size: 1.1em;
        }
        
        .content ul, .content ol {
            margin: 15px 0;
            padding-left: 30px;
        }
        
        .content li {
            margin: 8px 0;
        }
        
        .source-info {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            padding: 20px;
            margin: 40px 0;
        }
        
        .source-info h3 {
            color: #495057;
            margin-bottom: 15px;
        }
        
        .source-link {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
        }
        
        .source-link:hover {
            text-decoration: underline;
        }
        
        .research-summary {
            background: #e8f4fd;
            border-left: 4px solid #2196f3;
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 10px 10px 0;
        }
        
        .footer {
            text-align: center;
            padding: 40px 0;
            border-top: 1px solid #eee;
            margin-top: 50px;
            color: #666;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2em;
            }
            
            .meta-info {
                flex-direction: column;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>${generatedArticle.title}</h1>
            <div class="meta-info">
                <span>📅 ${new Date().toLocaleDateString('es-ES')}</span>
                <span>🤖 Generado con IA</span>
            </div>
        </header>
        
        <div class="image-placeholder">
            <div class="image-prompt">
                <strong>🎨 Imagen sugerida:</strong><br>
                <em>${generatedArticle.headerImagePrompt}</em>
            </div>
        </div>
        
        <main class="content">
            ${generatedArticle.content}
        </main>
        
        <aside class="source-info">
            <h3>📚 Artículo Original</h3>
            <p><strong>Título:</strong> ${originalArticle.title}</p>
            <p><strong>Fuente:</strong> ${originalArticle.source}</p>
            <p><strong>Enlace:</strong> <a href="${originalArticle.link}" target="_blank" class="source-link">Ver artículo original</a></p>
            <p><strong>Razón de selección:</strong> ${originalArticle.selectionReason}</p>
            <p><strong>Puntuación IA:</strong> ${originalArticle.score}/100</p>
        </aside>
        
        <div class="research-summary">
            <h3>🔬 Resumen de Investigación</h3>
            <p><strong>Consulta de investigación:</strong> ${research.query}</p>
            <p><strong>Tiempo de investigación:</strong> ${research.responseTime}s</p>
            <p><strong>Fuentes consultadas:</strong> ${research.sources.length}</p>
            <div class="sources">
                <h4>📚 Fuentes principales:</h4>
                <ul>
                    ${research.sources.slice(0, 3).map(source => 
                        `<li><a href="${source.url}" target="_blank">${source.title}</a> (Score: ${source.score.toFixed(2)})</li>`
                    ).join('') || '<li>No disponible</li>'}
                </ul>
            </div>
        </div>
        
        <footer class="footer">
            <p>Artículo generado automáticamente por <strong>TOTS Blog Creator</strong></p>
            <p>Procesado el ${new Date().toLocaleString('es-ES')}</p>
        </footer>
    </div>
</body>
</html>`;

    return html;
  }

  async saveHTML(html: string, filename?: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = filename || `article-${timestamp}.html`;
    const filePath = path.join(config.output.directory, fileName);
    
    try {
      await fs.writeFile(filePath, html, 'utf-8');
      console.log(`💾 HTML guardado en: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error('❌ Error guardando HTML:', error);
      throw new Error('Error guardando archivo HTML');
    }
  }
}
