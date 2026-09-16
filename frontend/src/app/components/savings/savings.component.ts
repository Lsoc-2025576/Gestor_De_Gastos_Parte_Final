import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SavingsService } from '../../services/savings.service';
import { Saving, SavingsStats } from '../../types/savings.types';
import { SavingsModalComponent } from './savings-modal.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-savings',
  standalone: true,
  imports: [CommonModule, RouterLink, SavingsModalComponent],
  templateUrl: './savings.html',
  styleUrls: ['./savings.css']
})
export class SavingsComponent implements OnInit {
  private savingsService = inject(SavingsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  savings = signal<Saving[]>([]);
  stats = signal<SavingsStats | null>(null);
  isModalOpen = signal(false);
  selectedSavingForEdit = signal<Saving | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.savingsService.getAll().subscribe({
      next: (res) => {
        if (res.data) {
          this.savings.set(res.data.savings);
          this.stats.set(res.data.stats);
        }
      },
      error: (err) => console.error('Error al cargar ahorros', err)
    });
  }

  openNewModal() {
    this.selectedSavingForEdit.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(saving: Saving) {
    this.selectedSavingForEdit.set(saving);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedSavingForEdit.set(null);
  }

  onSaveSuccess() {
    this.closeModal();
    this.loadData();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.authService.clearUser();
        this.router.navigate(['/login']);
      }
    });
  }
}