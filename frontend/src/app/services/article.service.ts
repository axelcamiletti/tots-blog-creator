import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, BehaviorSubject } from 'rxjs';
import {
  Article,
  CreateArticleRequest,
  ApiResponse
} from '../models/interfaces';
import { environment } from '../../environments/environment';

export interface LoadingArticle {
  tempId: string;
  request: CreateArticleRequest;
  startTime: Date;
}

export interface NotificationMessage {
  id: string;
  message: string;
  type: 'success' | 'error';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Estado para artículos en generación
  private loadingArticlesSubject = new BehaviorSubject<LoadingArticle[]>([]);
  public loadingArticles$ = this.loadingArticlesSubject.asObservable();

  // Estado para notificaciones
  private notificationsSubject = new BehaviorSubject<NotificationMessage | null>(null);
  public notifications$ = this.notificationsSubject.asObservable();

  // Obtener todos los artículos
  getArticles(): Observable<ApiResponse<Article[]>> {
    return this.http.get<ApiResponse<Article[]>>(`${this.apiUrl}/articles`);
  }

  async getArticlesAsync(): Promise<ApiResponse<Article[]>> {
    return firstValueFrom(this.getArticles());
  }

  // Obtener un artículo específico
  getArticleById(id: string): Observable<ApiResponse<Article>> {
    return this.http.get<ApiResponse<Article>>(`${this.apiUrl}/articles/${id}`);
  }

  async getArticleByIdAsync(id: string): Promise<ApiResponse<Article>> {
    return firstValueFrom(this.getArticleById(id));
  }

  // Generar nuevo artículo
  generateArticle(request: CreateArticleRequest): Observable<ApiResponse<Article>> {
    return this.http.post<ApiResponse<Article>>(
      `${this.apiUrl}/articles/generate`,
      request
    );
  }

  async generateArticleAsync(request: CreateArticleRequest): Promise<ApiResponse<Article>> {
    return firstValueFrom(this.generateArticle(request));
  }

  // Actualizar artículo
  updateArticle(id: string, updates: Partial<Article>): Observable<ApiResponse<Article>> {
    return this.http.put<ApiResponse<Article>>(
      `${this.apiUrl}/articles/${id}`,
      updates
    );
  }

  async updateArticleAsync(id: string, updates: Partial<Article>): Promise<ApiResponse<Article>> {
    return firstValueFrom(this.updateArticle(id, updates));
  }

  // Eliminar artículo
  deleteArticle(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/articles/${id}`);
  }

  async deleteArticleAsync(id: string): Promise<ApiResponse<null>> {
    return firstValueFrom(this.deleteArticle(id));
  }

  // Exportar artículo para web
  exportArticleToWeb(id: string): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/articles/${id}/export`, {}, {
      responseType: 'blob'
    });
  }

  async exportArticleToWebAsync(id: string): Promise<Blob> {
    return firstValueFrom(this.exportArticleToWeb(id));
  }

  // Métodos para manejar estado de loading
  addLoadingArticle(request: CreateArticleRequest): string {
    const tempId = `temp-${Date.now()}`;
    const loadingArticle: LoadingArticle = {
      tempId,
      request,
      startTime: new Date()
    };

    const current = this.loadingArticlesSubject.value;
    this.loadingArticlesSubject.next([...current, loadingArticle]);

    return tempId;
  }

  removeLoadingArticle(tempId: string): void {
    const current = this.loadingArticlesSubject.value;
    this.loadingArticlesSubject.next(current.filter(item => item.tempId !== tempId));
  }

  // Métodos para notificaciones
  showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    const notification: NotificationMessage = {
      id: `notif-${Date.now()}`,
      message,
      type,
      timestamp: new Date()
    };

    this.notificationsSubject.next(notification);

    // Auto-dismiss después de 5 segundos
    setTimeout(() => {
      this.clearNotification();
    }, 5000);
  }

  clearNotification(): void {
    this.notificationsSubject.next(null);
  }

  // Método mejorado para generar artículo con estado
  async generateArticleWithLoading(request: CreateArticleRequest): Promise<Article | null> {
    const tempId = this.addLoadingArticle(request);

    try {
      const response = await this.generateArticleAsync(request);

      if (response.success && response.data) {
        this.showNotification(`Artículo "${response.data.title}" generado exitosamente`, 'success');
        return response.data;
      } else {
        this.showNotification(`Error: ${response.error || 'No se pudo generar el artículo'}`, 'error');
        return null;
      }
    } catch (error) {
      console.error('Error generating article:', error);
      this.showNotification('Error inesperado al generar el artículo', 'error');
      return null;
    } finally {
      this.removeLoadingArticle(tempId);
    }
  }
}
