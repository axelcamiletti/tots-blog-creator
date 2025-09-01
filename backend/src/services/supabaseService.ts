import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { Article, GeneratedArticle } from '../interfaces/interfaces';
import dotenv from 'dotenv';

dotenv.config();

export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase URL and ANON KEY are required');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async createArticle(generatedArticle: GeneratedArticle, image_url?: string): Promise<Article> {
        // Ahora no necesitamos mapping porque usamos snake_case consistentemente
        const dbArticle = {
            title: generatedArticle.title,
            meta_title: generatedArticle.meta_title,
            meta_description: generatedArticle.meta_description,
            content: generatedArticle.content,
            segment: generatedArticle.segment,
            tags: generatedArticle.tags,
            category: generatedArticle.category,
            author: 'TOTS Team',
            sources: generatedArticle.sources,
            image_url: image_url,
            status: 'draft'
        };

        const { data, error } = await this.supabase
            .from('articles')
            .insert([dbArticle])
            .select()
            .single();

        if (error) {
            console.error('Error creating article in Supabase:', error);
            throw new Error(`Failed to create article: ${error.message}`);
        }

        return data as Article;
    }

    async getArticles(): Promise<Article[]> {
        const { data, error } = await this.supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching articles:', error);
            throw new Error(`Failed to fetch articles: ${error.message}`);
        }

        console.log('📥 [SupabaseService] Artículos obtenidos:', data?.map(article => ({
            id: article.id,
            title: article.title,
            status: article.status,
            statusType: typeof article.status
        })));

        return data as Article[];
    }

    async getArticleById(id: string): Promise<Article | null> {
        const { data, error } = await this.supabase
            .from('articles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Article not found
            }
            console.error('Error fetching article:', error);
            throw new Error(`Failed to fetch article: ${error.message}`);
        }

        return data as Article;
    }

    async updateArticle(id: string, updates: Partial<Article>): Promise<Article> {
        console.log('🔄 [SupabaseService] Actualizando artículo:', {
            id,
            fields: Object.keys(updates),
            status: updates.status,
            title: updates.title
        });

        const updateData = {
            ...updates,
            updated_at: new Date().toISOString()
        };

        console.log('📤 [SupabaseService] Datos a actualizar:', updateData);

        const { data, error } = await this.supabase
            .from('articles')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('❌ [SupabaseService] Error updating article:', error);
            throw new Error(`Failed to update article: ${error.message}`);
        }

        console.log('✅ [SupabaseService] Artículo actualizado exitosamente:', {
            id: data.id,
            status: data.status,
            title: data.title,
            updated_at: data.updated_at
        });

        return data as Article;
    }

    async deleteArticle(id: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('articles')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting article:', error);
            throw new Error(`Failed to delete article: ${error.message}`);
        }

        return true;
    }

    async uploadImage(imageBuffer: Buffer, fileName: string): Promise<string> {
        const filePath = `articles/${uuidv4()}/${fileName}`;

        const { data, error } = await this.supabase.storage
            .from('article-images')
            .upload(filePath, imageBuffer, {
                contentType: 'image/jpeg',
                upsert: false
            });

        if (error) {
            console.error('Error uploading image:', error);
            throw new Error(`Failed to upload image: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = this.supabase.storage
            .from('article-images')
            .getPublicUrl(filePath);

        return publicUrl;
    }

    async deleteImage(image_url: string): Promise<boolean> {
        try {
            // Extract file path from URL
            const urlParts = image_url.split('/');
            const bucketIndex = urlParts.findIndex(part => part === 'article-images');
            if (bucketIndex === -1) return false;

            const filePath = urlParts.slice(bucketIndex + 1).join('/');

            const { error } = await this.supabase.storage
                .from('article-images')
                .remove([filePath]);

            if (error) {
                console.error('Error deleting image:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error parsing image URL:', error);
            return false;
        }
    }
}
