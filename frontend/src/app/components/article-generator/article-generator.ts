import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { CreateArticleRequest } from '../../models/interfaces';

@Component({
  selector: 'app-article-generator',
  imports: [CommonModule, FormsModule],
  templateUrl: './article-generator.html',
  styleUrl: './article-generator.css'
})
export class ArticleGenerator {
  topic = '';
  segment = '';
  author = 'TOTS Team';
  isGenerating = false;
  generationStatus = '';

  segments = [
    'IA',
    'Apps móviles',
    'Sportech',
    'Ciberseguridad'
  ];

  constructor(private articleService: ArticleService) {}

  generateArticle() {
    if (!this.topic.trim()) {
      alert('Por favor, ingresa un tema para el artículo');
      return;
    }

    this.isGenerating = true;
    this.generationStatus = 'Iniciando generación del artículo...';

    const request: CreateArticleRequest = {
      topic: this.topic.trim(),
      segment: this.segment || undefined,
      author: this.author || 'TOTS Team'
    };

    this.articleService.generateArticle(request).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.generationStatus = `✅ Artículo "${response.data.title}" generado exitosamente!`;
          // Reset form
          this.topic = '';
          this.segment = '';
          // Emit event to refresh article list
          window.location.reload(); // Simple refresh for now
        } else {
          this.generationStatus = `❌ Error: ${response.error || 'Error desconocido'}`;
        }
        this.isGenerating = false;
      },
      error: (error) => {
        console.error('Error generating article:', error);
        this.generationStatus = `❌ Error generando artículo: ${error.message || 'Error de conexión'}`;
        this.isGenerating = false;
      }
    });
  }

  clearForm() {
    this.topic = '';
    this.segment = '';
    this.author = 'TOTS Team';
    this.generationStatus = '';
  }
}
