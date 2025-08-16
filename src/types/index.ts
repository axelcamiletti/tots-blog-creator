export interface Article {
  title: string;
  link: string;
  description: string;
  content?: string;
  pubDate?: string;
  author?: string;
  categories?: string[];
  tags?: string[];
  source: string;
}

export interface SelectedArticle extends Article {
  selectionReason: string;
  score: number;
}

export interface Source {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface ResearchData {
  query: string;
  responseTime: number;
  sources: Source[];
}

export interface GeneratedArticle {
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  headerImagePrompt: string;
}

export interface BlogCreationResult {
  originalArticle: SelectedArticle;
  research: ResearchData;
  generatedArticle: GeneratedArticle;
  htmlOutput: string;
}
