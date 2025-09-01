// Interfaces compartidas entre backend y frontend

export type ArticleStatus = 'draft' | 'in-progress' | 'published' | 'paused' | 'ready-to-publish';

export interface Article {
  id: string;
  title: string;
  meta_title: string;
  meta_description: string;
  content: string; // Markdown content
  segment: 'IA' | 'Apps móviles' | 'Sportech' | 'Ciberseguridad';
  tags: string[];
  category: string;
  author: string;
  sources: string[];
  image_url?: string;
  status: ArticleStatus;
  created_at: Date;
  updated_at: Date;
}

export interface CreateArticleRequest {
  topic: string;
  segment?: string;
  author?: string;
}

export interface CreateArticleResponse {
  success: boolean;
  article?: Article;
  error?: string;
}

export interface GenerateArticleRequest {
  topic: string;
  segment?: string;
  author?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ResearchResult {
  content: string;
  sources: string[];
}

export interface GeneratedArticle {
  title: string;
  meta_title: string;
  meta_description: string;
  content: string;
  segment: 'IA' | 'Apps móviles' | 'Sportech' | 'Ciberseguridad';
  tags: string[];
  category: string;
  author: string;
  sources: string[];
  image_url?: string;
  status: ArticleStatus;
  header_image_prompt?: string; // Solo para el proceso de generación
}

// Nueva interfaz para la creación de artículos
export interface ArticleGenerationProgress {
  step: 'research' | 'generation' | 'image' | 'saving' | 'completed';
  message: string;
  progress: number; // 0-100
}
