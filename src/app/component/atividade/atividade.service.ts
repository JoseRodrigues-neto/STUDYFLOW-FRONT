import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Atividade } from '../../models/atividade.model';
import { StatusAtividade } from '../../models/status-atividade.model';

@Injectable({
  providedIn: 'root'
})
export class AtividadeService {

  private apiUrl = 'https://9ec610758ec0.ngrok-free.app/atividades';
  private atividadesSubject = new ReplaySubject<Atividade[]>(1);
  public atividades$ = this.atividadesSubject.asObservable();
  
  constructor(private http: HttpClient) { }

  // --- MÉTODOS DE BUSCA PRIVADOS ---

  private fetchAndBroadcastByUser(usuarioId: number): Observable<Atividade[]> {
    return this.http.get<Atividade[]>(`${this.apiUrl}/usuario/${usuarioId}`).pipe(
      tap(atividades => this.atividadesSubject.next(atividades)),
      catchError(this.handleError)
    );
  }

  private fetchAndBroadcastByRoadmap(roadmapId: number): Observable<Atividade[]> {
    const allStatuses = Object.values(StatusAtividade);
    return this.getAtividadesByRoadmap(roadmapId, allStatuses).pipe(
      tap(atividades => this.atividadesSubject.next(atividades)),
      catchError(this.handleError)
    );
  }

  // --- MÉTODOS DE CARREGAMENTO PÚBLICOS ---

  public loadInitialAtividades(usuarioId: number): void {
     this.fetchAndBroadcastByUser(usuarioId).subscribe();
  }

  public loadAtividadesByRoadmap(roadmapId: number): void {
    this.fetchAndBroadcastByRoadmap(roadmapId).subscribe();
  }

  // --- MÉTODOS DE DADOS ---

  getAtividadesByRoadmap(roadmapId: number, statuses?: StatusAtividade[]): Observable<Atividade[]> {
    let params = new HttpParams();
    if (statuses && statuses.length > 0) {
      statuses.forEach(status => {
        params = params.append('status', status);
      });
    }
    const url = `${this.apiUrl}/roadmap/${roadmapId}`;
    return this.http.get<Atividade[]>(url, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<Atividade> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Atividade>(url).pipe(
      catchError(this.handleError)
    );
  }

  // --- MÉTODOS DE CRUD CONTEXTUAL ---

  create(atividade: Atividade, usuarioId: number, roadmapId?: number): Observable<Atividade[]> {
    return this.http.post<Atividade>(this.apiUrl, atividade).pipe(
      switchMap(() => roadmapId 
        ? this.fetchAndBroadcastByRoadmap(roadmapId) 
        : this.fetchAndBroadcastByUser(usuarioId)
      ),
      catchError(this.handleError)
    );
  }

  update(atividade: Atividade, usuarioId: number, roadmapId?: number): Observable<Atividade[]> {
    return this.http.put<Atividade>(`${this.apiUrl}/${atividade.id}`, atividade).pipe(
      switchMap(() => roadmapId 
        ? this.fetchAndBroadcastByRoadmap(roadmapId) 
        : this.fetchAndBroadcastByUser(usuarioId)
      ),
      catchError(this.handleError)
    );
  }
  
  updateStatus(atividadeId: number, status: StatusAtividade, usuarioId: number, roadmapId?: number): Observable<Atividade[]> {
    const url = `${this.apiUrl}/${atividadeId}/status`;
    return this.http.patch<Atividade>(url, { status }).pipe(
      switchMap(() => roadmapId 
        ? this.fetchAndBroadcastByRoadmap(roadmapId) 
        : this.fetchAndBroadcastByUser(usuarioId)
      ),
      catchError(this.handleError)
    );
  }

  delete(id: number, usuarioId: number, roadmapId?: number): Observable<Atividade[]> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      switchMap(() => roadmapId 
        ? this.fetchAndBroadcastByRoadmap(roadmapId) 
        : this.fetchAndBroadcastByUser(usuarioId)
      ),
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Ocorreu um erro na chamada da API!', error);
    return throwError(() => new Error('Algo deu errado; por favor, tente novamente mais tarde.'));
  }
}