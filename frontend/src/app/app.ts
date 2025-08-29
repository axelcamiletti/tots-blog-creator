import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ArticleGenerator } from './components/article-generator/article-generator';
import { ArticleList } from './components/article-list/article-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, ArticleGenerator, ArticleList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('TOTS Blog Creator');
}
