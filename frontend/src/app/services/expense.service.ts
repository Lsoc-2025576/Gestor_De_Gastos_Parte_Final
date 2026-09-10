import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Expense, ExpenseCreateDto, ExpenseUpdateDto, ExpenseSummary } from '../types/expense.types';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/expenses';

  getExpenses(): Observable<Expense[]> {
    return this.http.get<{ status: string; data: { expenses: Expense[] } }>(this.apiUrl, {
      withCredentials: true
    }).pipe(map(response => response.data.expenses));
  }

  getExpenseSummary(): Observable<ExpenseSummary> {
    return this.http.get<{ status: string; data: { summary: ExpenseSummary } }>(`${this.apiUrl}/summary`, {
      withCredentials: true
    }).pipe(map(response => response.data.summary));
  }

  createExpense(data: ExpenseCreateDto): Observable<Expense> {
    return this.http.post<{ status: string; data: { expense: Expense } }>(this.apiUrl, data, {
      withCredentials: true
    }).pipe(map(response => response.data.expense));
  }

  updateExpense(id: number, data: ExpenseUpdateDto): Observable<Expense> {
    return this.http.patch<{ status: string; data: { expense: Expense } }>(`${this.apiUrl}/${id}`, data, {
      withCredentials: true
    }).pipe(map(response => response.data.expense));
  }

  deleteExpense(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      withCredentials: true
    });
  }
}