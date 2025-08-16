#!/usr/bin/env node

import { BlogCreator } from './blogCreator';

async function main() {
  console.log('🎯 TOTS Blog Creator - Automatización de Artículos con IA');
  console.log('=========================================================\n');

  const blogCreator = new BlogCreator();

  try {
    const startTime = Date.now();
    
    // Ejecutar el proceso completo
    const result = await blogCreator.createBlogPost();
    
    // Mostrar resumen
    await blogCreator.displaySummary(result);
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log(`⏱️ Proceso completado en ${duration} segundos`);
    console.log('🎉 ¡Artículo listo para publicar!');
    
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

// Ejecutar solo si este archivo es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

export { BlogCreator };
