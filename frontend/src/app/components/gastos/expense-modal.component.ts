import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { ExpenseCategory, CreateExpenseDto } from '../../types/expense.types';

@Component({
  selector: 'app-expense-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-[#16273e] border border-slate-700 w-full max-w-md p-6 rounded-2xl shadow-2xl relative text-white">
        
        <div class="flex justify-between items-center mb-6 border-b border-slate-700 pb-3">
          <h3 class="text-xl font-bold text-[#f4ce60]">Registrar Nuevo Gasto</h3>
          <button (click)="close.emit()" class="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
        </div>

        @if (errorMessage()) {
          <div class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Nombre / Concepto</label>
            <input 
              type="text" 
              [(ngModel)]="name" 
              name="name" 
              required 
              placeholder="Ej. Supermercado La Torre"
              class="w-full bg-[#0b1420] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#f4ce60]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Monto (Q)</label>
            <input 
              type="number" 
              step="0.01" 
              [(ngModel)]="amount" 
              name="amount" 
              required 
              placeholder="0.00"
              class="w-full bg-[#0b1420] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#f4ce60]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Categoría</label>
            <select 
              [(ngModel)]="category" 
              name="category" 
              class="w-full bg-[#0b1420] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#f4ce60]"
            >
              <option value="SERVICIOS">Servicios</option>
              <option value="TRANSPORTE">Transporte</option>
              <option value="SUPER_MERCADO">Supermercado</option>
              <option value="OTROS">Otros</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Descripción (Opcional)</label>
            <textarea 
              [(ngModel)]="description" 
              name="description" 
              rows="2"
              placeholder="Detalles adicionales..."
              class="w-full bg-[#0b1420] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#f4ce60]"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t border-slate-700">
            <button 
              type="button" 
              (click)="close.emit()" 
              class="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              [disabled]="isLoading()"
              class="px-5 py-2 rounded-lg bg-[#f4ce60] hover:bg-[#d4a040] text-[#0b1420] font-bold transition disabled:opacity-50"
            >
              @if (isLoading()) { Guardando... } @else { Guardar Gasto }
            </button>
          </div>
        </form>

      </div>
    </div>
  `
})
export class ExpenseModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() saveSuccess = new EventEmitter<void>();

  private expenseService = inject(ExpenseService);

  name = '';
  amount: number | null = null;
  category: ExpenseCategory = 'OTROS';
  description = '';

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit() {
    if (!this.name.trim() || this.amount === null || this.amount <= 0) {
      this.errorMessage.set('Por favor, ingresa un nombre y un monto válido.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const dto: CreateExpenseDto = {
      name: this.name.trim(),
      amount: Number(this.amount),
      category: this.category,
      description: this.description.trim() ? this.description.trim() : null
    };

    this.expenseService.create(dto).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.saveSuccess.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.error || 'Error al guardar el gasto');
      }
    });
  }
}