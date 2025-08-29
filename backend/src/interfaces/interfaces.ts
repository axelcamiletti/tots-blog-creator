// Interfaces compartidas entre backend y frontend

export interface Article {
  id: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  content: string; // Markdown content
  segment: 'IA' | 'Apps móviles' | 'Sportech' | 'Ciberseguridad';
  tags: string[];
  category: string;
  author: string;
  sources: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArticleRequest {
  topic: string;
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
  metaTitle: string;
  metaDescription: string;
  content: string;
  segment: string;
  tags: string[];
  category: string;
  sources: string[];
  headerImagePrompt?: string;
}
