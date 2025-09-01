import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import {
  Article,
  CreateArticleRequest,
  ApiResponse
} from '../models/interfaces';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

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
}
