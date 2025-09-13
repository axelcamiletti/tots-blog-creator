import { Component, signal, inject, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ArticleGenerator } from './components/article-generator/article-generator';
import { OpenaiCreditsService, OpenAICredits } from './services/openai-credits.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, ArticleGenerator],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('🚀 TOTS Blog Creator');

  @ViewChild('createArticleModal') createArticleModal!: ElementRef<HTMLDialogElement>;

  private creditsService = inject(OpenaiCreditsService);

  protected credits$: Observable<OpenAICredits> = this.creditsService.getCurrentCredits();

  constructor() {
    // Cargar créditos automáticamente al inicializar la aplicación
    this.creditsService.loadCredits();
  }

  getCreditBarColor(percentage: number): string {
    if (percentage > 75) return 'bg-red-500';
    if (percentage > 50) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  getCreditTextColor(percentage: number): string {
    if (percentage > 75) return 'text-red-400';
    if (percentage > 50) return 'text-yellow-400';
    return 'text-green-400';
  }

  refreshCredits(): void {
    this.creditsService.refreshCredits();
  }

  closeModal(): void {
    this.createArticleModal.nativeElement.close();
  }

  /* openCreateArticleModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateArticleModal(): void {
    this.showCreateModal.set(false);
  } */
}
