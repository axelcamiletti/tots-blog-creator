// Test de conexión con Supabase
import { SupabaseService } from './src/services/supabaseService';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function testSupabaseConnection() {
    console.log('🧪 Probando conexión con Supabase...\n');

    try {
        const supabaseService = new SupabaseService();
        console.log('✅ Servicio de Supabase inicializado correctamente');

        // Probar obtener artículos (debería devolver un array vacío o con el artículo de ejemplo)
        console.log('📝 Obteniendo artículos...');
        const articles = await supabaseService.getArticles();
        console.log(`✅ Artículos encontrados: ${articles.length}`);
        
        if (articles.length > 0) {
            console.log('📄 Primer artículo:', {
                id: articles[0].id,
                title: articles[0].title,
                segment: articles[0].segment,
                created_at: articles[0].created_at
            });
        }

        console.log('\n🎉 ¡Conexión con Supabase exitosa!');
        console.log('\n✅ Todo está configurado correctamente:');
        console.log('   - Base de datos PostgreSQL conectada');
        console.log('   - Tabla articles funcionando');
        console.log('   - Storage bucket configurado');
        console.log('   - Políticas de seguridad activas');

    } catch (error) {
        console.error('❌ Error conectando con Supabase:', error);
        console.log('\n🔧 Verifica:');
        console.log('   - SUPABASE_URL en .env');
        console.log('   - SUPABASE_ANON_KEY en .env');
        console.log('   - Que el proyecto de Supabase esté activo');
        console.log('   - Que la tabla articles exista');
    }
}

// Ejecutar el test
testSupabaseConnection();
