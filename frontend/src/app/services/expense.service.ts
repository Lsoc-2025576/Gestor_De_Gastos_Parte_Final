import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense, ExpenseResponse, ExpenseSummaryResponse, CreateExpenseDto } from '../types/expense.types';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/expenses';

  getAll(): Observable<{ data: ExpenseResponse }> {
    return this.http.get<{ data: ExpenseResponse }>(this.apiUrl, { withCredentials: true });
  }

  getSummary(): Observable<{ data: ExpenseSummaryResponse }> {
    return this.http.get<{ data: ExpenseSummaryResponse }>(`${this.apiUrl}/summary`, { withCredentials: true });
  }

  create(dto: CreateExpenseDto): Observable<{ message: string; data: Expense }> {
    return this.http.post<{ message: string; data: Expense }>(this.apiUrl, dto, { withCredentials: true });
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}