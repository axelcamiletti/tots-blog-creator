import { BlogCreator } from './blogCreator';

async function testConnection() {
  console.log('🧪 Probando conexión y configuración...\n');
  
  try {
    // Verificar que las variables de entorno estén cargadas
    const { config } = await import('./config');
    
    console.log('✅ Configuración cargada:');
    console.log(`   - API Key OpenAI: ${config.openai.apiKey ? '✓ Configurada' : '❌ No encontrada'}`);
    console.log(`   - Feeds RSS: ${config.rss.feeds.length} feeds configurados`);
    console.log(`   - Max artículos: ${config.rss.maxArticles}`);
    
    // Verificar feeds RSS
    const { RSSService } = await import('./services/rssService');
    const rssService = new RSSService();
    
    console.log('\n📡 Probando feeds RSS...');
    const articles = await rssService.fetchAllArticles();
    
    if (articles.length > 0) {
      console.log(`✅ Se encontraron ${articles.length} artículos`);
      console.log(`   Primer artículo: "${articles[0].title}"`);
      console.log(`   Fuente: ${articles[0].source}`);
    } else {
      console.log('⚠️ No se encontraron artículos');
    }
    
    console.log('\n🎉 Configuración verificada correctamente!');
    console.log('   Puedes ejecutar: npm run create-article');
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
  }
}

testConnection();
