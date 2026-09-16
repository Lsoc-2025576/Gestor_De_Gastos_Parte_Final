import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SavingsService } from '../../services/savings.service';
import { CreateSavingDto, Saving } from '../../types/savings.types';

@Component({
  selector: 'app-savings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; background-color: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); padding: 16px; overflow-y: auto;">
      <div style="background-color: #ffffff; border: 1px solid #cbd5e1; width: 100%; max-width: 500px; padding: 24px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2); color: #16223f; margin: auto;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px;">
          <h3 style="font-size: 18px; font-weight: bold; color: #16223f; margin: 0;">
            {{ savingToEdit ? 'Editar Ahorro' : 'Registrar Nuevo Ahorro' }}
          </h3>
          <button (click)="close.emit()" style="background: none; border: none; color: #64748b; font-size: 24px; font-weight: bold; cursor: pointer;">&times;</button>
        </div>

        @if (errorMessage()) {
          <div style="margin-bottom: 16px; padding: 12px; background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: #dc2626; font-size: 13px;">
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Descripción / Concepto</label>
            <input 
              type="text" 
              [(ngModel)]="description" 
              name="description" 
              required 
              placeholder="Ej. Ahorro quincenal, Bono navideño"
              style="width: 100%; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; color: #16223f; outline: none;"
            />
          </div>

          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Monto (Q)</label>
            <input 
              type="number" 
              step="0.01" 
              [(ngModel)]="amount" 
              name="amount" 
              required 
              placeholder="0.00"
              style="width: 100%; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; color: #16223f; outline: none;"
            />
          </div>

          <div>
            <label style="display: block; font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 6px;">Categoría</label>
            <input 
              type="text" 
              [(ngModel)]="category" 
              name="category" 
              placeholder="Fondo de Ahorro"
              style="width: 100%; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; color: #16223f; outline: none;"
            />
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <button 
              type="button" 
              (click)="close.emit()" 
              style="padding: 10px 16px; border-radius: 8px; background-color: #e2e8f0; color: #334155; font-weight: 600; border: none; cursor: pointer;"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              [disabled]="isLoading()"
              style="padding: 10px 20px; border-radius: 8px; background-color: #16223f; color: #ffffff; font-weight: bold; border: none; cursor: pointer;"
            >
              @if (isLoading()) { Guardando... } @else { Guardar }
            </button>
          </div>
        </form>

      </div>
    </div>
  `
})
export class SavingsModalComponent implements OnInit {
  @Input() savingToEdit: Saving | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saveSuccess = new EventEmitter<void>();

  private savingsService = inject(SavingsService);

  description = '';
  amount: number | null = null;
  category = 'Fondo de Ahorro';

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    if (this.savingToEdit) {
      this.description = this.savingToEdit.description;
      this.amount = this.savingToEdit.amount;
      this.category = this.savingToEdit.category || 'Fondo de Ahorro';
    }
  }

  onSubmit() {
    if (!this.description.trim() || this.amount === null || this.amount <= 0) {
      this.errorMessage.set('Por favor, ingresa una descripción y un monto válido.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const dto: CreateSavingDto = {
      description: this.description.trim(),
      amount: Number(this.amount),
      category: this.category.trim() || 'Fondo de Ahorro'
    };

    // Si en el futuro agregas endpoint de update, puedes manejarlo aquí. Por ahora hace create.
    this.savingsService.create(dto).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.saveSuccess.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.error || 'Error al registrar el ahorro');
      }
    });
  }
}