import { ChangeDetectionStrategy, Component, signal, inject, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { CreateArticleRequest } from '../../models/interfaces';

@Component({
  selector: 'app-article-generator',
  templateUrl: './article-generator.html',
  styleUrls: ['./article-generator.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class ArticleGenerator {
  private readonly articleService = inject(ArticleService);
  private readonly router = inject(Router);

  // Event to emit when modal should close
  @Output() closeModalEvent = new EventEmitter<void>();

  // Form signals
  protected readonly topic = signal('');
  protected readonly segment = signal<string>('IA');
  protected readonly author = signal('TOTS Team');

  // UI states
  protected readonly isGenerating = signal(false);
  protected readonly error = signal<string | null>(null);

  // Segment options
  protected readonly segmentOptions = [
    'IA',
    'Apps móviles',
    'Sportech',
    'Ciberseguridad'
  ];

  protected async generateArticle() {
    console.log('🚀 [ArticleGenerator] Iniciando generación de artículo...');
    console.log('📋 [ArticleGenerator] Datos del formulario:', {
      topic: this.topic(),
      segment: this.segment(),
      author: this.author()
    });

    if (!this.topic().trim()) {
      console.warn('❌ [ArticleGenerator] Error: Tema vacío');
      this.error.set('El tema es requerido');
      return;
    }

    this.isGenerating.set(true);
    this.error.set(null);

    try {
      const request: CreateArticleRequest = {
        topic: this.topic().trim(),
        segment: this.segment(),
        author: this.author().trim()
      };

      console.log('📤 [ArticleGenerator] Enviando request al backend:', request);

      // Navegar inmediatamente al editor en modo "generando"
      console.log('🔄 [ArticleGenerator] Navegando al editor en modo generación...');
      this.router.navigate(['/edit/generating'], {
        state: {
          request: request,
          isGenerating: true
        }
      });

      // Cerrar el modal después de navegar
      this.closeModal();

      // Continuar con la generación en background
      const response = await this.articleService.generateArticleAsync(request);

      console.log('📥 [ArticleGenerator] Respuesta del backend:', response);

      if (response.success && response.data) {
        console.log('✅ [ArticleGenerator] Artículo generado exitosamente, ID:', response.data.id);
        // Navegar al editor con el artículo creado
        this.router.navigate(['/edit', response.data.id]);
      } else {
        console.error('❌ [ArticleGenerator] Error en la respuesta:', response.error);
        this.error.set(response.error || 'Error generando el artículo');
        // Volver al generador si hay error
        this.router.navigate(['/create']);
      }
    } catch (error) {
      console.error('💥 [ArticleGenerator] Error inesperado:', error);
      console.error('💥 [ArticleGenerator] Stack trace:', (error as Error).stack);
      this.error.set('Error inesperado al generar el artículo');
      // Volver al generador si hay error
      this.router.navigate(['/create']);
    } finally {
      console.log('🏁 [ArticleGenerator] Finalizando proceso de generación');
      this.isGenerating.set(false);
    }
  }

  protected onTopicChange(value: string) {
    this.topic.set(value);
    if (this.error()) {
      this.error.set(null);
    }
  }

  protected onSegmentChange(value: string) {
    this.segment.set(value);
  }

  protected onAuthorChange(value: string) {
    this.author.set(value);
  }

  protected goToArticleList() {
    this.router.navigate(['/list']);
  }

  protected closeModal() {
    console.log('🔄 [ArticleGenerator] Cerrando modal...');
    this.closeModalEvent.emit();
  }

  protected resetForm() {
    this.topic.set('');
    this.segment.set('IA');
    this.author.set('TOTS Team');
    this.error.set(null);
    this.isGenerating.set(false);
  }
}
