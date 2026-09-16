import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../types/expense.types';
import { ExpenseModalComponent } from './expense-modal.component';
import { AuthService } from '../../services/auth.service';
import { type User } from '../../types/auth.types';

@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [CommonModule, RouterLink, ExpenseModalComponent],
  templateUrl: './expenses.html',
  styleUrls: ['./expenses.css']
})
export class ExpensesComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private authService = inject(AuthService);
  private router = inject(Router);

  get user(): User | null {
    return this.authService.user();
  }

  expenses = signal<Expense[]>([]);
  isModalOpen = signal(false);

  totalGastos = computed(() => this.expenses().reduce((acc, exp) => acc + Number(exp.amount), 0));

  gastosPorCategoria = computed(() => {
    const list = this.expenses();
    const map: Record<string, number> = {
      SERVICIOS: 0,
      TRANSPORTE: 0,
      SUPER_MERCADO: 0,
      OTROS: 0
    };
    for (const exp of list) {
      if (map[exp.category] !== undefined) {
        map[exp.category] += Number(exp.amount);
      } else {
        map['OTROS'] += Number(exp.amount);
      }
    }
    return map;
  });

  ngOnInit() {
    this.loadExpenses();
  }

  loadExpenses() {
    this.expenseService.getAll().subscribe({
      next: (res) => {
        if (res.data) {
          this.expenses.set(res.data.expenses);
        }
      },
      error: (err) => console.error('Error al cargar gastos', err)
    });
  }

  openNewModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  deleteExpense(id: number) {
    if (confirm('¿Estás seguro de eliminar este gasto?')) {
      this.expenseService.delete(id).subscribe({
        next: () => this.loadExpenses(),
        error: (err) => console.error('Error al eliminar gasto', err)
      });
    }
  }

  onSaveSuccess() {
    this.closeModal();
    this.loadExpenses();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.authService.clearUser();
        this.router.navigate(['/login']);
      }
    });
  }
}