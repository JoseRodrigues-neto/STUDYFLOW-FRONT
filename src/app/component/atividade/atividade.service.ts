import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Atividade } from '../../models/atividade.model';
import { StatusAtividade } from '../../models/status-atividade.model';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AtividadeService {

  // 3. URL dinâmica
  private apiUrl = `${environment.apiUrl}/atividades`;
  
  private atividadesSubject = new ReplaySubject<Atividade[]>(1);
  public atividades$ = this.atividadesSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private authService: AuthService // <--- 4. Injeção do AuthService
  ) { }

  // --- HELPER PARA HEADERS ---
  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true' // O passe livre do Ngrok
    });
  }

  // --- MÉTODOS DE BUSCA PRIVADOS ---

  private fetchAndBroadcastByUser(statuses?: StatusAtividade[]): Observable<Atividade[]> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Sem token'));

        let params = new HttpParams();
        if (statuses && statuses.length > 0) {
          statuses.forEach(status => {
            params = params.append('status', status);
          });
        }

        return this.http.get<Atividade[]>(`${this.apiUrl}/usuario`, { headers: this.getHeaders(token), params });
      }),
      tap(atividades => this.atividadesSubject.next(atividades)),
      catchError(this.handleError)
    );
  }

  private fetchAndBroadcastDailyByUser(statuses?: StatusAtividade[]): Observable<Atividade[]> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Sem token'));
        
        let params = new HttpParams();
        if (statuses && statuses.length > 0) {
          statuses.forEach(status => {
            params = params.append('status', status);
          });
        }

        return this.http.get<Atividade[]>(`${this.apiUrl}/diarias`, { headers: this.getHeaders(token), params });
      }),
      tap(atividades => this.atividadesSubject.next(atividades)),
      catchError(this.handleError)
    );
  }

  private fetchAndBroadcastByRoadmap(roadmapId: number): Observable<Atividade[]> {
    return this.getAtividadesByRoadmap(roadmapId).pipe( // Reaproveita o método público que já trata o token
      tap(atividades => this.atividadesSubject.next(atividades)),
      catchError(this.handleError)
    );
  }

  // --- MÉTODOS DE CARREGAMENTO PÚBLICOS ---

  public loadInitialAtividades(statuses?: StatusAtividade[]): void {
     this.fetchAndBroadcastByUser(statuses).subscribe();
  }

  public loadDailyAtividades(statuses?: StatusAtividade[]): void {
    this.fetchAndBroadcastDailyByUser(statuses).subscribe();
  }

  public loadAtividadesByRoadmap(roadmapId: number): void {
    this.fetchAndBroadcastByRoadmap(roadmapId).subscribe();
  }

  // --- MÉTODOS DE DADOS ---

  getAtividadesByRoadmap(roadmapId: number, statuses?: StatusAtividade[]): Observable<Atividade[]> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Sem token'));

        let params = new HttpParams();
        if (statuses && statuses.length > 0) {
          statuses.forEach(status => {
            params = params.append('status', status);
          });
        }
        const url = `${this.apiUrl}/roadmap/${roadmapId}`;
        
        return this.http.get<Atividade[]>(url, { headers: this.getHeaders(token), params });
      }),
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<Atividade> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Sem token'));
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<Atividade>(url, { headers: this.getHeaders(token) });
      }),
      catchError(this.handleError)
    );
  }

  // --- MÉTODOS DE CRUD CONTEXTUAL ---

  create(atividade: Atividade, roadmapId?: number): Observable<Atividade[]> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Sem token'));
        
        // 1. Cria a atividade no backend
        return this.http.post<Atividade>(`${this.apiUrl}`, atividade, { headers: this.getHeaders(token) }).pipe(
           // 2. Se der certo, atualiza a lista correta
           switchMap(() => roadmapId 
             ? this.fetchAndBroadcastByRoadmap(roadmapId) 
             : this.fetchAndBroadcastByUser()
           )
        );
      }),
      catchError(this.handleError)
    );
  }

  update(atividade: Atividade, roadmapId?: number): Observable<Atividade[]> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Sem token'));

        return this.http.put<Atividade>(`${this.apiUrl}/${atividade.id}`, atividade, { headers: this.getHeaders(token) }).pipe(
          switchMap(() => roadmapId 
            ? this.fetchAndBroadcastByRoadmap(roadmapId) 
            : this.fetchAndBroadcastByUser()
          )
        );
      }),
      catchError(this.handleError)
    );
  }
  
  updateStatus(atividadeId: number, status: StatusAtividade, roadmapId?: number): Observable<Atividade[]> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Sem token'));

        const url = `${this.apiUrl}/${atividadeId}/status`;
        return this.http.patch<Atividade>(url, { status }, { headers: this.getHeaders(token) }).pipe(
          switchMap(() => roadmapId 
            ? this.fetchAndBroadcastByRoadmap(roadmapId) 
            : this.fetchAndBroadcastByUser()
          )
        );
      }),
      catchError(this.handleError)
    );
  }

  delete(id: number, roadmapId?: number): Observable<Atividade[]> {
    return this.authService.getIdToken().pipe(
      switchMap(token => {
        if (!token) return throwError(() => new Error('Sem token'));

        return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders(token) }).pipe(
          switchMap(() => roadmapId 
            ? this.fetchAndBroadcastByRoadmap(roadmapId) 
            : this.fetchAndBroadcastByUser()
          )
        );
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Ocorreu um erro na chamada da API!', error);
    return throwError(() => new Error('Algo deu errado; por favor, tente novamente mais tarde.'));
  }
}