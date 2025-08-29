import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/interfaces';

// Declare SimpleMDE for TypeScript
declare var SimpleMDE: any;

@Component({
  selector: 'app-article-editor',
  imports: [CommonModule, FormsModule],
  templateUrl: './article-editor.html',
  styleUrl: './article-editor.css'
})
export class ArticleEditor implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('markdownTextarea', { static: false }) markdownTextarea!: ElementRef;

  article: Article | null = null;
  loading = true;
  saving = false;
  error = '';
  markdownEditor: any;

  segments = [
    'IA',
    'Apps móviles',
    'Sportech',
    'Ciberseguridad'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService
  ) {}

  ngOnInit() {
    const articleId = this.route.snapshot.paramMap.get('id');
    if (articleId) {
      this.loadArticle(articleId);
    } else {
      this.loading = false;
      this.error = 'ID de artículo no proporcionado';
    }
  }

  ngAfterViewInit() {
    // Initialize SimpleMDE after view is initialized
    setTimeout(() => {
      this.initializeMarkdownEditor();
    }, 100);
  }

  ngOnDestroy() {
    if (this.markdownEditor) {
      this.markdownEditor.toTextArea();
    }
  }

  private initializeMarkdownEditor() {
    if (this.markdownTextarea && this.article) {
      this.markdownEditor = new SimpleMDE({
        element: this.markdownTextarea.nativeElement,
        spellChecker: false,
        status: ['lines', 'words', 'cursor'],
        toolbar: [
          'bold', 'italic', 'heading', '|',
          'quote', 'unordered-list', 'ordered-list', '|',
          'link', 'image', '|',
          'preview', 'side-by-side', 'fullscreen', '|',
          'guide'
        ]
      });

      // Set initial content
      this.markdownEditor.value(this.article.content);

      // Listen for changes
      this.markdownEditor.codemirror.on('change', () => {
        if (this.article) {
          this.article.content = this.markdownEditor.value();
        }
      });
    }
  }

  loadArticle(id: string) {
    this.loading = true;
    this.error = '';

    this.articleService.getArticleById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.article = response.data;
          // Initialize editor after article is loaded
          setTimeout(() => {
            this.initializeMarkdownEditor();
          }, 100);
        } else {
          this.error = response.error || 'Artículo no encontrado';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading article:', error);
        this.error = 'Error de conexión al cargar artículo';
        this.loading = false;
      }
    });
  }

  saveArticle() {
    if (!this.article) return;

    this.saving = true;

    // Get current markdown content from editor
    if (this.markdownEditor) {
      this.article.content = this.markdownEditor.value();
    }

    this.articleService.updateArticle(this.article.id, this.article).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.article = response.data;
          alert('✅ Artículo guardado exitosamente');
        } else {
          alert(`❌ Error guardando artículo: ${response.error}`);
        }
        this.saving = false;
      },
      error: (error) => {
        console.error('Error saving article:', error);
        alert('❌ Error de conexión al guardar artículo');
        this.saving = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  addTag() {
    if (this.article) {
      const tag = prompt('Ingresa un nuevo tag:');
      if (tag && tag.trim() && !this.article.tags.includes(tag.trim())) {
        this.article.tags.push(tag.trim());
      }
    }
  }

  removeTag(index: number) {
    if (this.article) {
      this.article.tags.splice(index, 1);
    }
  }

  addSource() {
    if (this.article) {
      const source = prompt('Ingresa una nueva fuente (URL):');
      if (source && source.trim() && !this.article.sources.includes(source.trim())) {
        this.article.sources.push(source.trim());
      }
    }
  }

  removeSource(index: number) {
    if (this.article) {
      this.article.sources.splice(index, 1);
    }
  }
}
