import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, of } from 'rxjs';
import { catchError, switchMap, startWith, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface OpenAICredits {
  available: number;
  totalBudget: number;
  availablePercentage: number;
  usedPercentage: number;
  used: number;
}

@Injectable({
  providedIn: 'root'
})
export class OpenaiCreditsService {
  private http = inject(HttpClient);
  private creditsSubject = new BehaviorSubject<OpenAICredits>({
    available: 0,
    totalBudget: 0,
    availablePercentage: 0,
    usedPercentage: 0,
    used: 0
  });

  public credits$ = this.creditsSubject.asObservable();

  private fetchCredits(): Observable<OpenAICredits> {
    const apiUrl = `${environment.apiUrl}/openai/credits`;

    return this.http.get<OpenAICredits>(apiUrl).pipe(
      tap(credits => {
        this.creditsSubject.next(credits);
      }),
      catchError(error => {
        console.error('Error fetching credits:', error);
        // Mantener los valores actuales en caso de error
        return of(this.creditsSubject.value);
      })
    );
  }

  loadCredits(): void {
    this.fetchCredits().subscribe();
  }

  getCurrentCredits(): Observable<OpenAICredits> {
    return this.credits$;
  }

  refreshCredits(): void {
    this.loadCredits();
  }
}
