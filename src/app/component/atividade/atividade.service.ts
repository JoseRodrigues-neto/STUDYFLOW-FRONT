import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Atividade } from '../../models/atividade.model';

@Injectable({
  providedIn: 'root'
})
export class AtividadeService {

  private apiUrl = 'http://localhost:8080/atividades';

  constructor(private http: HttpClient) { }

  getAtividadesByRoadmap(roadmapId: number): Observable<Atividade[]> {
    const url = `${this.apiUrl}/roadmap/${roadmapId}`;
    
    return this.http.get<Atividade[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<Atividade> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Atividade>(url).pipe(
      catchError(this.handleError)
    );
  }

  create(atividade: Atividade): Observable<Atividade> {
    return this.http.post<Atividade>(this.apiUrl, atividade);
  }

  update(atividade: Atividade): Observable<Atividade> {
    return this.http.put<Atividade>(`${this.apiUrl}/${atividade.id}`, atividade);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  private handleError(error: any) {
    console.error('Ocorreu um erro na chamada da API!', error);
    return throwError(() => new Error('Algo deu errado; por favor, tente novamente mais tarde.'));
  }
}