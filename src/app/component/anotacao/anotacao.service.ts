import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Anotacao } from '../../models/anotacao.model';

@Injectable({
  providedIn: 'root'
})
export class AnotacaoService {

  // A URL base da sua API para o recurso de anotacoes
  private apiUrl = 'http://localhost:8080/anotacoes';

  constructor(private http: HttpClient) { }

  getAnotacoesByAtividade(atividadeId: number): Observable<Anotacao[]> {
    // Corrigido para o endpoint correto encontrado no backend
    const url = `${this.apiUrl}/search/atividade/${atividadeId}`; 
    
    return this.http.get<Anotacao[]>(url).pipe(
      catchError(this.handleError)
    );
  }

  getAnotacaoById(id: number): Observable<Anotacao> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Anotacao>(url).pipe(
      catchError(this.handleError)
    );
  }

  create(anotacao: Anotacao): Observable<Anotacao> {
    return this.http.post<Anotacao>(this.apiUrl, anotacao).pipe(
      catchError(this.handleError)
    );
  }

  update(anotacao: Anotacao): Observable<Anotacao> {
    return this.http.put<Anotacao>(`${this.apiUrl}/${anotacao.id}`, anotacao).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    
    return this.http.delete<any>(url).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Ocorreu um erro na chamada da API!', error);
    return throwError(() => new Error('Algo deu errado; por favor, tente novamente mais tarde.'));
  }
}