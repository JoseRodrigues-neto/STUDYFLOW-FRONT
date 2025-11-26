// import { Component, Input } from '@angular/core';
// import { DashboardApiResponse, DashboardData } from '../../models/dashboard-data.model';

// // Importações do Angular Material
// import { MatCardModule } from '@angular/material/card';
// import { MatProgressBarModule } from '@angular/material/progress-bar';
// import {  DecimalPipe } from '@angular/common';
// import { NgIf, NgFor, NgClass } from '@angular/common';

// @Component({
//   selector: 'app-status-breakdown',
//   templateUrl: './status-breakdown.component.html',
//   styleUrls: ['./status-breakdown.component.css'],
//   standalone: true,
//   imports: [MatProgressBarModule, NgIf, NgFor, DecimalPipe, MatCardModule, NgClass] // Importa os módulos que o template usa
// })
// export class StatusBreakdownComponent {
//   @Input() data!: DashboardApiResponse;
//   items: any[] = [];

//   ngOnChanges() {
//     if (this.data) {
//       this.items = [
//       { label: 'Concluídas', value: this.data.atividadesConcluidas, class: 'progress-green' },
//         { label: 'Pendentes', value: this.data.atividadesPendentes, class: 'progress-blue' },
//         { label: 'Em Andamento', value: this.data.atividadesEmAndamento, class: 'progress-yellow' }
//       ];
//     }
//   }

//   calculateProgress(value: number): number {
//     if (!this.data || this.data.totalAtividades === 0) {
//       return 0;
//     }
//     return (value / this.data.totalAtividades) * 100;
//   }
// }