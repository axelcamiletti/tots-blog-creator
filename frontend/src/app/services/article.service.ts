import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Article,
  CreateArticleRequest,
  ApiResponse
} from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Obtener todos los artículos
  getArticles(): Observable<ApiResponse<Article[]>> {
    return this.http.get<ApiResponse<Article[]>>(`${this.apiUrl}/articles`);
  }

  // Obtener un artículo específico
  getArticleById(id: string): Observable<ApiResponse<Article>> {
    return this.http.get<ApiResponse<Article>>(`${this.apiUrl}/articles/${id}`);
  }

  // Generar nuevo artículo
  generateArticle(request: CreateArticleRequest): Observable<ApiResponse<Article>> {
    return this.http.post<ApiResponse<Article>>(
      `${this.apiUrl}/articles/generate`,
      request
    );
  }

  // Actualizar artículo
  updateArticle(id: string, updates: Partial<Article>): Observable<ApiResponse<Article>> {
    return this.http.put<ApiResponse<Article>>(
      `${this.apiUrl}/articles/${id}`,
      updates
    );
  }

  // Eliminar artículo
  deleteArticle(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/articles/${id}`);
  }
}
