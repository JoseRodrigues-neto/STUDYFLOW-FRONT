// dashboard/dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { BaseChartDirective } from 'ng2-charts';

import { DashboardService } from '../services/dashboard.service';
import { DashboardData, RoadmapResumo } from '../models/dashboard-data.model';
import { merge, Subject, debounceTime, switchMap, startWith } from 'rxjs';
import { Chart, registerables, ChartConfiguration, ChartType } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatCardModule,
    BaseChartDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  dashboardData?: DashboardData;
  isLoading = true;
  error: string | null = null;

  // filtros
  roadmapControl = new FormControl<'all' | number | null>('all');
  periodControl = new FormControl<string>('30d');
  dateFromControl = new FormControl<Date | null>(null);
  dateToControl = new FormControl<Date | null>(null);
  orderControl = new FormControl<string>('date_desc');

  private filter$ = new Subject<void>();

  // charts data holders
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  public doughnutChartOptions: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false };

  public createdBarData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  public createdBarType: ChartType = 'bar';

  public concludedLineData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  public concludedLineType: ChartType = 'line';

  public roadmapBarData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  public roadmapBarType: ChartType = 'bar';

  // roadmaps select
  roadmaps: RoadmapResumo[] = [];

  ngOnInit(): void {
    this.setupFiltersSubscription();
    this.triggerFetch();
  }

  private setupFiltersSubscription() {
    const roadmapChanges$ = this.roadmapControl.valueChanges;
    const periodChanges$ = this.periodControl.valueChanges;
    const fromChanges$ = this.dateFromControl.valueChanges;
    const toChanges$ = this.dateToControl.valueChanges;
    const orderChanges$ = this.orderControl.valueChanges;

    merge(
      roadmapChanges$,
      periodChanges$,
      fromChanges$,
      toChanges$,
      orderChanges$,
      this.filter$.asObservable()
    ).pipe(
      debounceTime(300),
      startWith(null),
      switchMap(() => {
        this.isLoading = true;
        this.error = null;
        const filters = this.buildFilters();
        return this.dashboardService.getDashboardData(filters);
      })
    ).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.roadmaps = data.roadmaps || [];
        this.updateAllCharts(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Falha ao carregar dados.';
        this.isLoading = false;
      }
    });
  }

  private buildFilters() {
    const roadmapVal = this.roadmapControl.value;
    const period = this.resolvePeriod();
    const order = this.orderControl.value;

    const filters: { roadmapId?: number; from?: string; to?: string; order?: string } = {};
    if (roadmapVal && roadmapVal !== 'all') {
      // if roadmapVal is an id (number) send id; if string (titulo) try match id
      if (typeof roadmapVal === 'number') {
        filters.roadmapId = Number(roadmapVal);
      } else {
        const found = this.roadmaps.find(r => r.titulo === roadmapVal);
        if (found && found.id) filters.roadmapId = found.id;
      }
    }
    if (period.from) filters.from = period.from;
    if (period.to) filters.to = period.to;
    if (order) filters.order = order;
    return filters;
  }

  private resolvePeriod(): { from?: string; to?: string } {
    const preset = this.periodControl.value;
    const now = new Date();
    let from: Date | null = null;
    let to: Date | null = null;

    if (preset === 'today') {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      to = from;
    } else if (preset === '7d') {
      to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      from = new Date(); from.setDate(to.getDate() - 6);
    } else if (preset === '30d') {
      to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      from = new Date(); from.setDate(to.getDate() - 29);
    } else if (preset === 'month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (preset === 'year') {
      from = new Date(now.getFullYear(), 0, 1);
      to = new Date(now.getFullYear(), 11, 31);
    } else if (preset === 'custom') {
      from = this.dateFromControl.value || null;
      to = this.dateToControl.value || null;
    }

    const toIso = to ? to.toISOString().slice(0, 10) : undefined;
    const fromIso = from ? from.toISOString().slice(0, 10) : undefined;
    return { from: fromIso, to: toIso };
  }

  private updateAllCharts(data: DashboardData) {
    // Status donut
    const statusLabels = Object.keys(data.statusCounts || {});
    const statusValues = statusLabels.map(k => data.statusCounts[k] ?? 0);
    this.doughnutChartData = {
      labels: statusLabels,
      datasets: [{ data: statusValues, backgroundColor: ['#34c759', '#ff9500', '#007aff'] }]
    };

    // Criadas por mês (outraCoisa)
    const createdMap = data.atividadesCriadasPorMes || {};
    const createdLabels = this.sortMonthKeys(Object.keys(createdMap));
    const createdValues = createdLabels.map(k => createdMap[k] ?? 0);
    this.createdBarData = {
      labels: createdLabels,
      datasets: [{ label: 'Criadas', data: createdValues, backgroundColor: '#007aff' }]
    };

    // Concluídas por mês (outraCoisa2)
    const conclMap = data.atividadesConcluidasPorMes || {};
    const conclLabels = this.sortMonthKeys(Object.keys(conclMap));
    const conclValues = conclLabels.map(k => conclMap[k] ?? 0);
    this.concludedLineData = {
      labels: conclLabels,
      datasets: [{ label: 'Concluídas', data: conclValues, borderColor: '#34c759', fill: false }]
    };

    // Roadmap compare
    const labels = (data.roadmaps || []).map(r => r.titulo);
    const concl = (data.roadmaps || []).map(r => r.concluidas ?? 0);
    const total = (data.roadmaps || []).map(r => r.total ?? 0);
    this.roadmapBarData = {
      labels,
      datasets: [
        { label: 'Concluídas', data: concl, backgroundColor: '#34c759' },
        { label: 'Total', data: total, backgroundColor: '#6b7280' }
      ]
    };
  }

  // sort month keys like yyyy-MM ascending
  private sortMonthKeys(keys: string[]): string[] {
    return keys.slice().sort((a, b) => a.localeCompare(b));
  }

  triggerFetch() { this.filter$.next(); }

  // local ordering helper for roadmaps
  orderLocalBy(option: string) {
    if (!this.dashboardData?.roadmaps) return;
    if (option === 'roadmap') this.dashboardData.roadmaps.sort((a,b) => a.titulo.localeCompare(b.titulo));
    if (option === 'concluded_desc') this.dashboardData.roadmaps.sort((a,b) => (b.concluidas ?? 0) - (a.concluidas ?? 0));
  }
}
