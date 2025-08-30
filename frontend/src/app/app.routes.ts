import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/article-list/article-list').then(m => m.ArticleList)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./components/article-editor/article-editor').then(m => m.ArticleEditor)
  },
  {
    path: 'create',
    loadComponent: () => import('./components/article-generator/article-generator').then(m => m.ArticleGenerator)
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
