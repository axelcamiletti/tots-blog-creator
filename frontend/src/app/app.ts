import { Component, signal, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ArticleGenerator } from './components/article-generator/article-generator';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, ArticleGenerator],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('TOTS Blog Creator');
  protected readonly showCreateModal = signal(false);

  private router = inject(Router);

  openCreateArticleModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateArticleModal(): void {
    this.showCreateModal.set(false);
  }
}
