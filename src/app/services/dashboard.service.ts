// services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, switchMap, take, throwError, map } from 'rxjs';
import { ApiRoadmapResumo, DashboardApiResponse, DashboardData, RoadmapResumo } from '../models/dashboard-data.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
 // private apiUrl = 'https://9ec610758ec0.ngrok-free.app/dashboard/me';
private apiUrl = 'http://localhost:8080/dashboard/me';
  constructor(private http: HttpClient, private auth: AuthService) {}

  getDashboardData(filters?: {
    roadmapId?: number;
    from?: string;
    to?: string;
    order?: string;
  }): Observable<DashboardData> {
    return this.auth.getIdToken().pipe(
      take(1),
      switchMap(token => {
        if (!token) return throwError(() => new Error('Usuário não autenticado'));

        let params = new HttpParams();
        if (filters) {
          if (filters.roadmapId != null) params = params.set('roadmapId', String(filters.roadmapId));
          if (filters.from) params = params.set('from', filters.from);
          if (filters.to) params = params.set('to', filters.to);
          if (filters.order) params = params.set('order', filters.order);
        }

        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.get<DashboardApiResponse>(this.apiUrl, { headers, params })
          .pipe(map(api => this.normalize(api)));
      })
    );
  }

  /** Normaliza nomes/estruturas do backend para o formato que o componente espera */
  private normalize(api: DashboardApiResponse): DashboardData {
    const roadmaps: RoadmapResumo[] = (api.roadmaps || []).map((r: ApiRoadmapResumo) => ({
      id: r.id,
      titulo: r.titulo,
      total: (r.total ?? 0),
      concluidas: (r.concluidas ?? 0)
    }));

    // backend uses outraCoisa and outraCoisa2 for created/concluded by month
    const atividadesCriadasPorMes = api.outraCoisa ?? {};
    const atividadesConcluidasPorMes = api.outraCoisa2 ?? {};

    // normalize statusCounts keys order (optional)
    const statusCounts = api.statusCounts ?? {};

    return {
      total: api.total ?? 0,
      concluidas: api.concluidas ?? 0,
      pendentes: api.pendentes ?? 0,
      emAndamento: api.emAndamento ?? 0,
      statusCounts,
      roadmaps,
      atividadesCriadasPorMes,
      atividadesConcluidasPorMes,
      usuario: api.usuario ?? null
    };
  }
}