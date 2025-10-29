import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Atividade } from '../../model/atividade.model';

@Injectable({
  providedIn: 'root'
})
export class AtividadeService {

  // A URL base da sua API para o recurso de atividades
  private apiUrl = 'http://localhost:8080/atividades';

  constructor(private http: HttpClient) { }

  getAtividadesByRoadmap(roadmapId: number): Observable<Atividade[]> {
    const url = `${this.apiUrl}?roadmapId=${roadmapId}`;
    
    return this.http.get<Atividade[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  create(atividade: Atividade): Observable<Atividade> {
    return this.http.post<Atividade>(this.apiUrl, atividade);
  }

  update(atividade: Atividade): Observable<Atividade> {
    return this.http.put<Atividade>(`${this.apiUrl}/${atividade.id}`, atividade);
  }

  delete(atividade: Atividade): Observable<any> {
    return this.http.delete<Atividade>(`${this.apiUrl}/${atividade.id}`);
  }

  private handleError(error: any) {
    console.error('Ocorreu um erro na chamada da API!', error);
    return throwError(() => new Error('Algo deu errado; por favor, tente novamente mais tarde.'));
  }
}