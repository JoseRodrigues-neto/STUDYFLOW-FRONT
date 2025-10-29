import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { DashboardData } from '../models/dashboard-data.model';

// Importações de Módulos e Componentes
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { KpiCardComponent } from '../components/kpi-card/kpi-card.component';
import { StatusBreakdownComponent } from '../components/status-breakdown/status-breakdown.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    NgIf,
    MatProgressSpinnerModule,
    KpiCardComponent,
    StatusBreakdownComponent
  ]
})
export class DashboardComponent implements OnInit {
  public dashboardData: DashboardData | null = null;
  public isLoading: boolean = true;
  public error: string | null = null;

  // 1. A variável 'usuarioId' foi removida, pois não é mais utilizada.
  // private usuarioId: number = 1;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    // 2. A chamada ao serviço agora é feita sem argumentos.
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Falha ao carregar os dados do dashboard. Verifique a API e a autenticação.';
        console.error(err);
        this.isLoading = false;
      }
    });
  }
}