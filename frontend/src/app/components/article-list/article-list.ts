import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/interfaces';

@Component({
  selector: 'app-article-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './article-list.html',
  styleUrl: './article-list.css'
})
export class ArticleList implements OnInit {
  articles: Article[] = [];
  loading = true;
  error = '';

  constructor(private articleService: ArticleService) {}

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    this.loading = true;
    this.error = '';

    this.articleService.getArticles().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.articles = response.data;
        } else {
          this.error = response.error || 'Error cargando artículos';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading articles:', error);
        this.error = 'Error de conexión al cargar artículos';
        this.loading = false;
      }
    });
  }

  deleteArticle(article: Article) {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${article.title}"?`)) {
      return;
    }

    this.articleService.deleteArticle(article.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.articles = this.articles.filter(a => a.id !== article.id);
        } else {
          alert(`Error eliminando artículo: ${response.error}`);
        }
      },
      error: (error) => {
        console.error('Error deleting article:', error);
        alert('Error de conexión al eliminar artículo');
      }
    });
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getSegmentColor(segment: string): string {
    const colors: { [key: string]: string } = {
      'IA': 'bg-purple-100 text-purple-800',
      'Apps móviles': 'bg-green-100 text-green-800',
      'Sportech': 'bg-blue-100 text-blue-800',
      'Ciberseguridad': 'bg-red-100 text-red-800'
    };
    return colors[segment] || 'bg-gray-100 text-gray-800';
  }

  getArticleCountBySegment(segment: string): number {
    return this.articles.filter(article => article.segment === segment).length;
  }
}
