import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArticleService, LoadingArticle, NotificationMessage } from '../../services/article.service';
import { Article } from '../../models/interfaces';

@Component({
  selector: 'app-article-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './article-list.html',
  styleUrl: './article-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleList {
  private readonly articleService = inject(ArticleService);

  protected readonly articles = signal<Article[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly loadingArticles = signal<LoadingArticle[]>([]);
  protected readonly notification = signal<NotificationMessage | null>(null);

  protected readonly segments = ['IA', 'Apps móviles', 'Sportech', 'Ciberseguridad'] as const;

  protected readonly articleStats = computed(() => {
    const articlesArray = this.articles();
    return {
      total: articlesArray.length,
      bySegment: this.segments.reduce((acc, segment) => {
        acc[segment] = articlesArray.filter(article => article.segment === segment).length;
        return acc;
      }, {} as Record<string, number>)
    };
  });

  constructor() {
    this.loadArticles();

    // Suscribirse a artículos en generación
    this.articleService.loadingArticles$.subscribe(loadingArticles => {
      this.loadingArticles.set(loadingArticles);
    });

    // Suscribirse a notificaciones
    this.articleService.notifications$.subscribe(notification => {
      this.notification.set(notification);

      // Si hay una notificación de éxito, recargar artículos
      if (notification?.type === 'success') {
        setTimeout(() => {
          this.loadArticles();
        }, 1000);
      }
    });
  }

  protected loadArticles() {
    this.loading.set(true);
    this.error.set('');

    this.articleService.getArticles().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.articles.set(response.data);
        } else {
          this.error.set(response.error || 'Error cargando artículos');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading articles:', error);
        this.error.set('Error de conexión al cargar artículos');
        this.loading.set(false);
      }
    });
  }

  protected deleteArticle(article: Article) {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${article.title}"?`)) {
      return;
    }

    this.articleService.deleteArticle(article.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.articles.update(articles => articles.filter(a => a.id !== article.id));
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

  protected formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected getSegmentColor(segment: string): string {
    const colors: { [key: string]: string } = {
      'IA': 'bg-purple-100 text-purple-800',
      'Apps móviles': 'bg-green-100 text-green-800',
      'Sportech': 'bg-blue-100 text-blue-800',
      'Ciberseguridad': 'bg-red-100 text-red-800'
    };
    return colors[segment] || 'bg-gray-100 text-gray-800';
  }

  protected getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'draft': 'bg-gray-100 text-gray-800 border border-gray-300',
      'in-progress': 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      'ready-to-publish': 'bg-green-100 text-green-800 border border-green-300',
      'published': 'bg-blue-100 text-blue-800 border border-blue-300',
      'paused': 'bg-red-100 text-red-800 border border-red-300'
    };

    // Si no encuentra el estado, loggear y usar draft como default
    if (!statusColors[status]) {
      console.warn('⚠️ [ArticleList] Estado no reconocido:', status, 'Usando draft como default');
      return statusColors['draft'];
    }

    return statusColors[status];
  }

  protected getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'draft': '📝 Draft',
      'in-progress': '⚠️ In Progress',
      'ready-to-publish': '✅ Ready to publish',
      'published': '🌐 Published',
      'paused': '⏸️ Paused'
    };

    // Si no encuentra el estado, loggear y usar draft como default
    if (!statusLabels[status]) {
      console.warn('⚠️ [ArticleList] Estado no reconocido:', status, 'Usando draft como default');
      return statusLabels['draft'];
    }

    return statusLabels[status];
  }

  protected dismissNotification() {
    this.articleService.clearNotification();
  }

  protected formatLoadingTime(startTime: Date): string {
    const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
    return `${elapsed}s`;
  }
}
