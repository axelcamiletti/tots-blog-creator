import { OpenAIService } from './services/openaiService';
import { SelectedArticle } from './types';

async function testDeepResearch(): Promise<void> {
  console.log('🧪 Iniciando test de Deep Research...\n');

  // Crear objeto de prueba con los datos proporcionados
  const testArticle: SelectedArticle = {
    title: "Designing With AI, Not Around It: Practical Advanced Techniques For Product Design Use Cases",
    link: "https://www.smashingmagazine.com/2025/08/designing-with-ai-practical-techniques-product-design/",
    description: "Prompting isn't just about writing better instructions, but about designing better thinking. Ilia Kanazin and Marina Chernyshova explore how advanced prompting can empower different product & design use cases, speeding up your workflow and improving results, from research and brainstorming to testing and beyond. Let's dive in.",
    source: "Smashing Magazine",
    categories: ["AI", "Product Design", "UX", "Prompting"],
    selectionReason: "Artículo de prueba para Deep Research - tema actual sobre IA en diseño",
    score: 95
  };

  console.log('📋 Datos del artículo de prueba:');
  console.log(`📌 Título: ${testArticle.title}`);
  console.log(`🔗 Enlace: ${testArticle.link}`);
  console.log(`📝 Descripción: ${testArticle.description}`);
  console.log(`📊 Puntuación: ${testArticle.score}/100`);
  console.log(`💡 Razón: ${testArticle.selectionReason}\n`);

  try {
    const openaiService = new OpenAIService();
    
    console.log('🚀 Ejecutando Deep Research...\n');
    const startTime = Date.now();
    
    // Ejecutar la función de Deep Research
    await openaiService.executeDeepResearch(testArticle);
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n✅ Test de Deep Research completado exitosamente!');
    console.log(`⏱️ Duración total: ${duration} segundos`);
    
  } catch (error) {
    console.error('\n❌ Error en el test de Deep Research:', error);
    if (error instanceof Error) {
      console.error('📝 Mensaje de error:', error.message);
      console.error('🔍 Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Ejecutar el test
if (require.main === module) {
  testDeepResearch()
    .then(() => {
      console.log('\n🎉 Test finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

export { testDeepResearch };
