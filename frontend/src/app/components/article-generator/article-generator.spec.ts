import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleGenerator } from './article-generator';

describe('ArticleGenerator', () => {
  let component: ArticleGenerator;
  let fixture: ComponentFixture<ArticleGenerator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleGenerator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleGenerator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
