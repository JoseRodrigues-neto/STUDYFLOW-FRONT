import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

// Importa as interfaces que definiste
import { 
  DashboardApiResponse, 
  DashboardData, 
  ApiRoadmapResumo, 
  RoadmapResumo 
} from '../models/dashboard-data.model';

// Ajuste os caminhos conforme a tua estrutura de pastas
import { AuthService } from './auth.service'; 
import { environment } from '../../environments/environment';

// Definimos a interface do Filtro aqui (ou no model se preferires)
export interface DashboardFilter {
  roadmapId?: number;
  from?: string; // yyyy-MM-dd
  to?: string;   // yyyy-MM-dd
  order?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  private apiUrl = `${environment.apiUrl}/dashboard/me`;

  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) { }

  getDashboardData(filters?: DashboardFilter): Observable<DashboardData> {
    return this.authService.getIdToken().pipe(
      take(1),
      switchMap(token => {
        if (!token) return throwError(() => new Error('Usuário não autenticado'));

        // 1. Montagem dos parâmetros de filtro (Query Params)
        let params = new HttpParams();
        if (filters) {
          if (filters.roadmapId != null) params = params.set('roadmapId', String(filters.roadmapId));
          if (filters.from) params = params.set('from', filters.from);
          if (filters.to) params = params.set('to', filters.to);
          if (filters.order) params = params.set('order', filters.order);
        }

        // 2. Headers com Auth e Ngrok
        const headers = new HttpHeaders({ 
          'Authorization': `Bearer ${token}`, 
          'ngrok-skip-browser-warning': 'true' 
        });

        // 3. Chamada e Normalização
        return this.http.get<DashboardApiResponse>(this.apiUrl, { headers, params })
          .pipe(map(api => this.normalize(api)));
      })
    );
  }

  /** * Traduz os dados do Backend (nomes estranhos) para o Frontend (nomes bonitos)
   */
  private normalize(api: DashboardApiResponse): DashboardData {
    
    // Mapeia os Roadmaps
    const roadmaps: RoadmapResumo[] = (api.roadmaps || []).map((r: ApiRoadmapResumo) => ({
      id: r.id,
      titulo: r.titulo,
      total: (r.total ?? 0),
      concluidas: (r.concluidas ?? 0)
    }));

    // --- AQUI ESTÁ A CORREÇÃO PRINCIPAL ---
    // Mapeia 'outraCoisa' para 'atividadesCriadasPorMes'
    const atividadesCriadasPorMes = api.outraCoisa ?? {};
    
    // Mapeia 'outraCoisa2' para 'atividadesConcluidasPorMes'
    const atividadesConcluidasPorMes = api.outraCoisa2 ?? {};

    const statusCounts = api.statusCounts ?? {};

    return {
      total: api.total ?? 0,
      concluidas: api.concluidas ?? 0,
      pendentes: api.pendentes ?? 0,
      emAndamento: api.emAndamento ?? 0,
      statusCounts,
      roadmaps,
      atividadesCriadasPorMes,     // Agora com o dado correto
      atividadesConcluidasPorMes,  // Agora com o dado correto
      usuario: api.usuario ?? null
    };
  }
}