import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SavingsResponse, Saving, CreateSavingDto } from '../types/savings.types';

@Injectable({
  providedIn: 'root'
})
export class SavingsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/savings';

  getAll(): Observable<{ data: SavingsResponse }> {
    return this.http.get<{ data: SavingsResponse }>(this.apiUrl, { withCredentials: true });
  }

  create(dto: CreateSavingDto): Observable<{ message: string; data: Saving }> {
    return this.http.post<{ message: string; data: Saving }>(this.apiUrl, dto, { withCredentials: true });
  }
}