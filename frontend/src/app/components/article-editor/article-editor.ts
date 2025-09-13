import {
  ChangeDetectionStrategy,
  Component,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { Article, ArticleStatus } from '../../models/interfaces';

// Declare SimpleMDE for TypeScript
declare var SimpleMDE: any;

@Component({
  selector: 'app-article-editor',
  templateUrl: './article-editor.html',
  styleUrls: ['./article-editor.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule]
})
export class ArticleEditor implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('markdownTextarea', { static: false }) markdownTextarea!: ElementRef;
  @ViewChild('titleTextarea', { static: false }) titleTextarea!: ElementRef;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly articleService = inject(ArticleService);

  // State signals
  protected readonly article = signal<Article | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly hasUnsavedChanges = signal(false);
  protected readonly isExporting = signal(false);
  protected readonly exportProgress = signal<string>('');

  // Editor reference
  private markdownEditor: any;
  private autoSaveInterval: any;

  // Options
  protected readonly segmentOptions = [
    'IA',
    'Apps móviles',
    'Sportech',
    'Ciberseguridad'
  ];

  protected readonly statusOptions: { value: ArticleStatus; label: string; color: string }[] = [
    { value: 'draft', label: '📝 Borrador', color: 'bg-gray-500' },
    { value: 'in-progress', label: '⚠️ En Progreso', color: 'bg-blue-500' },
    { value: 'ready-to-publish', label: '✅ Listo para Publicar', color: 'bg-green-500' },
    { value: 'published', label: '🌐 Publicado', color: 'bg-black' },
    { value: 'paused', label: '⏸️ Pausado', color: 'bg-yellow-500' }
  ];

  // Computed para obtener el estado actual del artículo
  protected readonly currentStatus = computed(() => {
    const article = this.article();
    return article?.status || 'draft';
  });

  ngOnInit() {
    console.log('🎯 [ArticleEditor] Iniciando componente...');

    const articleId = this.route.snapshot.paramMap.get('id');
    console.log('🆔 [ArticleEditor] ID del artículo:', articleId);

    // Verificar si estamos en modo "generating"
    if (articleId === 'generating') {
      console.log('⚡ [ArticleEditor] Modo generación detectado');
      this.handleGeneratingMode();
    } else if (articleId) {
      console.log('📖 [ArticleEditor] Cargando artículo existente...');
      this.loadArticle(articleId);
    } else {
      console.warn('❌ [ArticleEditor] ID de artículo no proporcionado');
      this.isLoading.set(false);
      this.error.set('ID de artículo no proporcionado');
    }

    // Setup auto-save every 30 seconds
    this.autoSaveInterval = setInterval(() => {
      if (this.hasUnsavedChanges() && this.article() && !this.isSaving()) {
        this.saveArticle(true); // Auto-save
      }
    }, 30000);
  }

  ngAfterViewInit() {
    // Initialize SimpleMDE after view is initialized
    setTimeout(() => {
      this.initializeMarkdownEditor();
      this.initializeTitleTextarea();
    }, 100);
  }

  ngOnDestroy() {
    if (this.markdownEditor) {
      this.markdownEditor.toTextArea();
    }
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }

  private initializeMarkdownEditor() {
    if (this.markdownTextarea && this.article()) {
      this.markdownEditor = new SimpleMDE({
        element: this.markdownTextarea.nativeElement,
        spellChecker: false,
        toolbar: [
          'bold', 'italic', 'heading-1', 'heading-2', 'heading-3', '|',
          'quote', 'unordered-list', 'ordered-list', '|',
          'link', 'image', '|',
          'guide'
        ],
        autofocus: false,
        placeholder: 'Escribe tu artículo en Markdown...'
      });

      // Set initial content
      const article = this.article();
      if (article) {
        this.markdownEditor.value(article.content);
      }

      // Listen for changes
      this.markdownEditor.codemirror.on('change', () => {
        const currentArticle = this.article();
        if (currentArticle) {
          const newContent = this.markdownEditor.value();
          if (newContent !== currentArticle.content) {
            this.article.set({
              ...currentArticle,
              content: newContent
            });
            this.hasUnsavedChanges.set(true);
          }
        }
      });
    }
  }

  private initializeTitleTextarea() {
    if (this.titleTextarea && this.article()) {
      // Auto-resize the title textarea to fit initial content
      setTimeout(() => {
        this.autoResizeTextarea(this.titleTextarea.nativeElement);
      }, 50);
    }
  }

  private handleGeneratingMode() {
    console.log('⚡ [ArticleEditor] Iniciando modo generación...');

    // Establecer estado de loading con mensaje personalizado
    this.isLoading.set(true);
    this.error.set(null);

    // Obtener los datos de la navegación si están disponibles
    const navigationState = history.state;
    console.log('📦 [ArticleEditor] Estado de navegación:', navigationState);

    if (navigationState?.request) {
      console.log('📋 [ArticleEditor] Datos de la request:', navigationState.request);

      // Crear un artículo temporal para mostrar mientras se genera
      const tempArticle: Article = {
        id: 'generating',
        title: `Generando artículo sobre: ${navigationState.request.topic}`,
        meta_title: '',
        meta_description: '',
        content: '# Generando contenido...\n\n⏳ El artículo se está generando usando IA. Por favor espera...\n\n**Tema:** ' + navigationState.request.topic + '\n**Segmento:** ' + navigationState.request.segment + '\n**Autor:** ' + navigationState.request.author,
        segment: navigationState.request.segment,
        tags: [],
        category: '',
        author: navigationState.request.author,
        sources: [],
        image_url: undefined,
        status: 'draft' as ArticleStatus,
        created_at: new Date(),
        updated_at: new Date()
      };

      this.article.set(tempArticle);
      console.log('🎭 [ArticleEditor] Artículo temporal creado:', tempArticle);
    }

    // El loading se mantendrá hasta que la generación termine
    // y naveguemos al artículo real
  }

  private async loadArticle(id: string) {
    console.log('📖 [ArticleEditor] Cargando artículo con ID:', id);
    this.isLoading.set(true);
    this.error.set(null);

    try {
      console.log('📤 [ArticleEditor] Enviando request al backend para obtener artículo...');
      const response = await this.articleService.getArticleByIdAsync(id);

      console.log('📥 [ArticleEditor] Respuesta del backend:', response);

      if (response.success && response.data) {
        console.log('✅ [ArticleEditor] Artículo cargado exitosamente:', {
          id: response.data.id,
          title: response.data.title,
          status: response.data.status,
          statusType: typeof response.data.status
        });
        this.article.set(response.data);
        this.hasUnsavedChanges.set(false);

        // Initialize editor after article is loaded
        setTimeout(() => {
          this.initializeMarkdownEditor();
          this.initializeTitleTextarea();
        }, 100);
      } else {
        console.error('❌ [ArticleEditor] Error cargando artículo:', response.error);
        this.error.set(response.error || 'Artículo no encontrado');
      }
    } catch (error) {
      console.error('💥 [ArticleEditor] Error inesperado cargando artículo:', error);
      this.error.set('Error de conexión al cargar artículo');
    } finally {
      console.log('🏁 [ArticleEditor] Finalizando carga de artículo');
      this.isLoading.set(false);
    }
  }

  protected async saveArticle(isAutoSave = false) {
    const currentArticle = this.article();
    if (!currentArticle) return;

    console.log('💾 [ArticleEditor] Guardando artículo:', {
      id: currentArticle.id,
      status: currentArticle.status,
      title: currentArticle.title
    });

    this.isSaving.set(true);
    this.error.set(null);

    try {
      // Get current markdown content from editor
      if (this.markdownEditor) {
        currentArticle.content = this.markdownEditor.value();
      }

      console.log('📤 [ArticleEditor] Enviando al backend:', {
        id: currentArticle.id,
        status: currentArticle.status,
        fieldsToUpdate: Object.keys(currentArticle)
      });

      const response = await this.articleService.updateArticleAsync(currentArticle.id, currentArticle);

      console.log('📥 [ArticleEditor] Respuesta del backend:', response);

      if (response.success && response.data) {
        console.log('✅ [ArticleEditor] Artículo actualizado exitosamente:', {
          id: response.data.id,
          status: response.data.status,
          title: response.data.title
        });

        this.article.set(response.data);
        this.hasUnsavedChanges.set(false);

        if (!isAutoSave) {
          // Show success message only for manual saves
          this.showSuccessMessage('✅ Artículo guardado exitosamente');
        }
      } else {
        console.error('❌ [ArticleEditor] Error en la respuesta:', response.error);
        this.error.set(response.error || 'Error guardando el artículo');
      }
    } catch (error) {
      console.error('💥 [ArticleEditor] Error inesperado guardando artículo:', error);
      this.error.set('Error de conexión al guardar artículo');
    } finally {
      this.isSaving.set(false);
    }
  }

  private showSuccessMessage(message: string) {
    // Simple success feedback - could be replaced with a toast notification
    const originalError = this.error();
    this.error.set(message);
    setTimeout(() => {
      if (this.error() === message) {
        this.error.set(originalError);
      }
    }, 3000);
  }

  protected goBack() {
    if (this.hasUnsavedChanges()) {
      const shouldLeave = confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?');
      if (!shouldLeave) return;
    }
    this.router.navigate(['/list']);
  }

  protected updateField(field: keyof Article, value: any) {
    const currentArticle = this.article();
    if (currentArticle) {
      console.log(`🔧 [ArticleEditor] Actualizando campo '${field}':`, {
        valorAnterior: currentArticle[field],
        valorNuevo: value,
        tipo: typeof value
      });

      this.article.set({
        ...currentArticle,
        [field]: value
      });
      this.hasUnsavedChanges.set(true);
    }
  }

  protected addTag() {
    const currentArticle = this.article();
    if (currentArticle) {
      const tag = prompt('Ingresa un nuevo tag:');
      if (tag && tag.trim() && !currentArticle.tags.includes(tag.trim())) {
        this.updateField('tags', [...currentArticle.tags, tag.trim()]);
      }
    }
  }

  protected removeTag(index: number) {
    const currentArticle = this.article();
    if (currentArticle) {
      const newTags = [...currentArticle.tags];
      newTags.splice(index, 1);
      this.updateField('tags', newTags);
    }
  }

  protected addSource() {
    const currentArticle = this.article();
    if (currentArticle) {
      const source = prompt('Ingresa una nueva fuente (URL):');
      if (source && source.trim() && !currentArticle.sources.includes(source.trim())) {
        this.updateField('sources', [...currentArticle.sources, source.trim()]);
      }
    }
  }

  protected removeSource(index: number) {
    const currentArticle = this.article();
    if (currentArticle) {
      const newSources = [...currentArticle.sources];
      newSources.splice(index, 1);
      this.updateField('sources', newSources);
    }
  }

  protected async deleteArticle() {
    const currentArticle = this.article();
    if (!currentArticle) return;

    const shouldDelete = confirm(`¿Estás seguro de que quieres eliminar el artículo "${currentArticle.title}"? Esta acción no se puede deshacer.`);
    if (!shouldDelete) return;

    try {
      this.isSaving.set(true);
      const response = await this.articleService.deleteArticleAsync(currentArticle.id);

      if (response.success) {
        this.router.navigate(['/list']);
      } else {
        this.error.set(response.error || 'Error eliminando el artículo');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      this.error.set('Error de conexión al eliminar artículo');
    } finally {
      this.isSaving.set(false);
    }
  }

  // Event handlers for form inputs
  protected onInputChange(field: keyof Article, event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    this.updateField(field, target.value);
  }

  protected onTitleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;

    // Update the article field
    this.updateField('title', target.value);

    // Auto-resize the textarea
    this.autoResizeTextarea(target);
  }

  private autoResizeTextarea(textarea: HTMLTextAreaElement) {
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';

    // Set the height to the scrollHeight to fit the content
    // Add a minimum height equivalent to one line
    const minHeight = 60; // Minimum height in pixels
    textarea.style.height = Math.max(textarea.scrollHeight, minHeight) + 'px';
  }

  protected onSelectChange(field: keyof Article, event: Event) {
    const target = event.target as HTMLSelectElement;
    this.updateField(field, target.value);
  }

  // Exportar artículo para web
  protected async exportToWeb() {
    const currentArticle = this.article();
    if (!currentArticle) {
      console.warn('❌ [Editor] No hay artículo para exportar');
      return;
    }

    console.log('🌐 [Editor] Iniciando exportación para web...');
    this.isExporting.set(true);
    this.exportProgress.set('Iniciando exportación...');

    try {
      // Guardar cambios antes de exportar
      if (this.hasUnsavedChanges()) {
        this.exportProgress.set('Guardando cambios...');
        await this.saveArticle(false);
      }

      // Simular progreso de exportación
      const progressSteps = [
        'Descargando imagen...',
        'Optimizando imágenes...',
        'Traduciendo contenido...',
        'Convirtiendo a HTML...',
        'Generando paquete...'
      ];

      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
          this.exportProgress.set(progressSteps[currentStep]);
          currentStep++;
        }
      }, 2000);

      // Realizar exportación
      const blob = await this.articleService.exportArticleToWebAsync(currentArticle.id);

      // Limpiar interval
      clearInterval(progressInterval);
      this.exportProgress.set('Descargando archivo...');

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `article-${currentArticle.id}-export.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ [Editor] Exportación completada exitosamente');
      this.exportProgress.set('¡Descarga completada!');

      // Limpiar estado después de 2 segundos
      setTimeout(() => {
        this.isExporting.set(false);
        this.exportProgress.set('');
      }, 2000);

    } catch (error) {
      console.error('💥 [Editor] Error en exportación:', error);
      this.exportProgress.set('Error en exportación');

      setTimeout(() => {
        this.isExporting.set(false);
        this.exportProgress.set('');
      }, 3000);
    }
  }
}
