import { Routes } from '@angular/router';
import { ArticleEditor } from './components/article-editor/article-editor';

export const routes: Routes = [
  {
    path: 'edit/:id',
    component: ArticleEditor
  },
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  }
];
